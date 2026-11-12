from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import PortfolioTransaction, Stock, StockPrice, User
from app.schemas.portfolio import (
    PortfolioTransactionCreate,
    PortfolioTransactionResponse,
    PortfolioHoldingResponse,
    PortfolioSummaryResponse,
)
from app.core.security import get_current_user
from app.services.market_data import get_stock_quote


router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


ZERO = Decimal("0")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calculate_holdings(db: Session, user_id: int):
    transactions = (
        db.query(PortfolioTransaction)
        .filter(PortfolioTransaction.user_id == user_id)
        .order_by(
            PortfolioTransaction.transaction_date.asc(),
            PortfolioTransaction.id.asc(),
        )
        .all()
    )

    holdings = {}

    for transaction in transactions:
        stock_id = transaction.stock_id

        if stock_id not in holdings:
            holdings[stock_id] = {
                "stock": transaction.stock,
                "quantity": ZERO,
                "cost": ZERO,
                "realized_profit_loss": ZERO,
            }

        holding = holdings[stock_id]

        quantity = Decimal(str(transaction.quantity))
        price = Decimal(str(transaction.price))

        if transaction.transaction_type == "BUY":
            holding["quantity"] += quantity
            holding["cost"] += quantity * price

        elif transaction.transaction_type == "SELL":
            average_cost = (
                holding["cost"] / holding["quantity"]
                if holding["quantity"] > ZERO
                else ZERO
            )

            holding["realized_profit_loss"] += (
                quantity * (price - average_cost)
            )

            holding["quantity"] -= quantity
            holding["cost"] -= quantity * average_cost

    return [
        holding
        for holding in holdings.values()
        if holding["quantity"] > ZERO
    ]


def get_current_price(db: Session, stock):
    try:
        quote = get_stock_quote(stock.symbol)
        price = quote.get("c")

        if price is not None and Decimal(str(price)) > ZERO:
            return Decimal(str(price))

    except Exception:
        pass

    latest_price = (
        db.query(StockPrice)
        .filter(StockPrice.stock_id == stock.id)
        .order_by(StockPrice.recorded_at.desc())
        .first()
    )

    if latest_price:
        return Decimal(str(latest_price.price))

    return None


def build_holdings_response(db: Session, user_id: int):
    calculated = calculate_holdings(db, user_id)
    results = []

    for holding in calculated:
        stock = holding["stock"]
        quantity = holding["quantity"]
        cost = holding["cost"]

        average_price = cost / quantity
        current_price = get_current_price(db, stock)

        current_value = (
            quantity * current_price
            if current_price is not None
            else None
        )

        unrealized = (
            current_value - cost
            if current_value is not None
            else None
        )

        results.append(
            PortfolioHoldingResponse(
                stock_id=stock.id,
                symbol=stock.symbol,
                company_name=stock.company_name,
                exchange=stock.exchange,
                quantity=quantity,
                average_buy_price=average_price,
                current_price=current_price,
                invested_value=cost,
                current_value=current_value,
                unrealized_profit_loss=unrealized,
                realized_profit_loss=holding["realized_profit_loss"],
            )
        )

    return results


@router.post(
    "/transactions",
    response_model=PortfolioTransactionResponse,
    status_code=201,
)
def create_transaction(
    data: PortfolioTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stock = db.query(Stock).filter(
        Stock.id == data.stock_id
    ).first()

    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    if data.transaction_type == "SELL":
        transactions = (
            db.query(PortfolioTransaction)
            .filter(
                PortfolioTransaction.user_id == current_user.id,
                PortfolioTransaction.stock_id == stock.id,
            )
            .all()
        )

        available_quantity = sum(
            (
                Decimal(str(t.quantity))
                if t.transaction_type == "BUY"
                else -Decimal(str(t.quantity))
            )
            for t in transactions
        )

        if data.quantity > available_quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient holdings. "
                    f"Available quantity: {available_quantity}"
                ),
            )

    transaction = PortfolioTransaction(
        user_id=current_user.id,
        stock_id=stock.id,
        transaction_type=data.transaction_type,
        quantity=data.quantity,
        price=data.price,
        transaction_date=(
            data.transaction_date or datetime.now(timezone.utc)
        ),
        notes=data.notes,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.get(
    "/transactions",
    response_model=list[PortfolioTransactionResponse],
)
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(PortfolioTransaction)
        .filter(PortfolioTransaction.user_id == current_user.id)
        .order_by(PortfolioTransaction.transaction_date.desc())
        .all()
    )


@router.get(
    "/holdings",
    response_model=list[PortfolioHoldingResponse],
)
def get_holdings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return build_holdings_response(db, current_user.id)


@router.get(
    "/summary",
    response_model=PortfolioSummaryResponse,
)
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    holdings = build_holdings_response(db, current_user.id)

    invested = sum(
        (item.invested_value for item in holdings),
        ZERO,
    )

    priced_holdings = [
        item for item in holdings
        if item.current_value is not None
    ]

    current_value = sum(
        (item.current_value for item in priced_holdings),
        ZERO,
    )

    unrealized = sum(
        (item.unrealized_profit_loss for item in priced_holdings),
        ZERO,
    )

    realized = sum(
        (item.realized_profit_loss for item in holdings),
        ZERO,
    )

    return PortfolioSummaryResponse(
        total_invested=invested,
        current_value=current_value,
        unrealized_profit_loss=unrealized,
        realized_profit_loss=realized,
        total_profit_loss=unrealized + realized,
        holdings_count=len(holdings),
        priced_holdings_count=len(priced_holdings),
    )
