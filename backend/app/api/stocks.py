
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timezone
import httpx

from app.db.session import SessionLocal
from app.models import User, Stock, StockPrice
from app.schemas.stock import StockCreate, StockResponse
from app.schemas.stock_price import StockPriceResponse
from app.core.security import require_admin
from app.services.market_data import get_stock_quote


router = APIRouter(prefix="/stocks", tags=["Stocks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# POST - Create Stock
@router.post("/", response_model=StockResponse, status_code=201)
def create_stock(
    stock_data: StockCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    symbol = stock_data.symbol.strip().upper()

    existing_stock = (
        db.query(Stock)
        .filter(Stock.symbol == symbol)
        .first()
    )

    if existing_stock:
        raise HTTPException(
            status_code=409,
            detail="Stock already exists",
        )

    stock = Stock(
        symbol=symbol,
        company_name=stock_data.company_name,
        exchange=stock_data.exchange,
    )

    db.add(stock)
    db.commit()
    db.refresh(stock)

    return stock


# GET - All Stocks
@router.get("/", response_model=list[StockResponse])
def list_stocks(db: Session = Depends(get_db)):
    return db.query(Stock).order_by(Stock.symbol).all()


# GET - Single Stock
@router.get("/{symbol}", response_model=StockResponse)
def get_stock(
    symbol: str,
    db: Session = Depends(get_db),
):
    stock = (
        db.query(Stock)
        .filter(Stock.symbol == symbol.strip().upper())
        .first()
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found",
        )

    return stock


# GET - Latest Live Stock Price
@router.get("/{symbol}/price", response_model=StockPriceResponse)
def get_latest_stock_price(
    symbol: str,
    db: Session = Depends(get_db),
):
    stock = (
        db.query(Stock)
        .filter(Stock.symbol == symbol.strip().upper())
        .first()
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found",
        )

    # Fetch quote from Finnhub
    try:
        quote = get_stock_quote(stock.symbol)

    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Market data provider request failed",
        ) from exc

    current_price = quote.get("c")

    if current_price is None or current_price <= 0:
        raise HTTPException(
            status_code=404,
            detail="Live stock price not available",
        )

    # Convert Finnhub timestamp to datetime
    quote_timestamp = quote.get("t")

    recorded_at = (
        datetime.fromtimestamp(
            quote_timestamp,
            tz=timezone.utc,
        )
        if quote_timestamp
        else datetime.now(timezone.utc)
    )

    # Check for an existing record with the same timestamp
    existing_price = (
        db.query(StockPrice)
        .filter(
            StockPrice.stock_id == stock.id,
            StockPrice.recorded_at == recorded_at,
        )
        .first()
    )

    if existing_price:
        existing_price.price = Decimal(str(current_price))

        existing_price.open_price = (
            Decimal(str(quote["o"]))
            if quote.get("o") is not None
            else None
        )

        existing_price.high_price = (
            Decimal(str(quote["h"]))
            if quote.get("h") is not None
            else None
        )

        existing_price.low_price = (
            Decimal(str(quote["l"]))
            if quote.get("l") is not None
            else None
        )

        try:
            db.commit()
            db.refresh(existing_price)

        except Exception:
            db.rollback()
            raise

        return existing_price

    # Create a new price record
    price_record = StockPrice(
        stock_id=stock.id,
        price=Decimal(str(current_price)),
        open_price=(
            Decimal(str(quote["o"]))
            if quote.get("o") is not None
            else None
        ),
        high_price=(
            Decimal(str(quote["h"]))
            if quote.get("h") is not None
            else None
        ),
        low_price=(
            Decimal(str(quote["l"]))
            if quote.get("l") is not None
            else None
        ),
        recorded_at=recorded_at,
    )

    try:
        db.add(price_record)
        db.commit()
        db.refresh(price_record)

    except Exception:
        db.rollback()
        raise

    return price_record


# GET - Historical Stock Prices
@router.get(
    "/{symbol}/history",
    response_model=list[StockPriceResponse],
)
def get_stock_price_history(
    symbol: str,
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    stock = (
        db.query(Stock)
        .filter(Stock.symbol == symbol.strip().upper())
        .first()
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found",
        )

    price_history = (
        db.query(StockPrice)
        .filter(StockPrice.stock_id == stock.id)
        .order_by(StockPrice.recorded_at.desc())
        .limit(limit)
        .all()
    )

    return price_history
