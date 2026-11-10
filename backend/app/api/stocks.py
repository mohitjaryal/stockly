
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
from datetime import datetime, timezone
import httpx

from app.db.session import SessionLocal
from app.models import User, Stock, StockPrice, HistoricalCandle
from app.schemas.stock import StockCreate, StockResponse
from app.schemas.stock_price import StockPriceResponse
from app.core.security import require_admin, get_current_user
from app.services.market_data import (
    get_stock_quote,
    get_stock_candles,
    search_stock_symbols,
)

router = APIRouter(prefix="/stocks", tags=["Stocks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# POST - Create Stock (Admin Only)
@router.post("/", response_model=StockResponse, status_code=201)
def create_stock(
    stock_data: StockCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    symbol = stock_data.symbol.strip().upper()
    company_name = stock_data.company_name.strip()
    exchange = stock_data.exchange.strip() if stock_data.exchange else None

    if not symbol or not company_name:
        raise HTTPException(
            status_code=400,
            detail="Symbol and company name are required",
        )

    if len(symbol) > 20 or len(company_name) > 255:
        raise HTTPException(
            status_code=400,
            detail="Stock symbol or company name exceeds allowed length",
        )

    existing_stock = db.query(Stock).filter(
        Stock.symbol == symbol
    ).first()

    if existing_stock:
        raise HTTPException(
            status_code=409,
            detail="Stock already exists",
        )

    stock = Stock(
        symbol=symbol,
        company_name=company_name,
        exchange=exchange,
    )

    try:
        db.add(stock)
        db.commit()
        db.refresh(stock)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Stock already exists",
        ) from exc

    return stock


# POST - Add Stock (Authenticated Users)
@router.post("/add", response_model=StockResponse, status_code=201)
def add_stock(
    stock_data: StockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    symbol = stock_data.symbol.strip().upper()
    company_name = stock_data.company_name.strip()
    exchange = stock_data.exchange.strip() if stock_data.exchange else None

    if not symbol or not company_name:
        raise HTTPException(
            status_code=400,
            detail="Symbol and company name are required",
        )

    if len(symbol) > 20:
        raise HTTPException(
            status_code=400,
            detail="Stock symbol cannot exceed 20 characters",
        )

    if len(company_name) > 255:
        raise HTTPException(
            status_code=400,
            detail="Company name cannot exceed 255 characters",
        )

    if exchange and len(exchange) > 50:
        raise HTTPException(
            status_code=400,
            detail="Exchange cannot exceed 50 characters",
        )

    existing_stock = db.query(Stock).filter(
        Stock.symbol == symbol
    ).first()

    if existing_stock:
        raise HTTPException(
            status_code=409,
            detail=f"{symbol} already exists in Stockly",
        )

    stock = Stock(
        symbol=symbol,
        company_name=company_name,
        exchange=exchange,
    )

    try:
        db.add(stock)
        db.commit()
        db.refresh(stock)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"{symbol} already exists in Stockly",
        ) from exc

    return stock


# GET - All Stocks
@router.get("/", response_model=list[StockResponse])
def list_stocks(
    db: Session = Depends(get_db),
):
    return (
        db.query(Stock)
        .order_by(Stock.symbol)
        .all()
    )


# GET - Search Stocks
# Keep this route before /{symbol}
@router.get("/search")
def search_stocks(
    q: str = Query(..., min_length=1, max_length=100),
    exchange: str | None = Query(default=None, max_length=20),
):
    query = q.strip()
    exchange_filter = exchange.strip() if exchange else None
    exchange_filter = exchange_filter or None

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty",
        )

    try:
        data = search_stock_symbols(query, exchange_filter)

    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail="Stock search is not configured",
        ) from exc

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail="Stock search provider returned an error",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to stock search provider",
        ) from exc

    results = data.get("result", [])

    return {
        "count": len(results),
        "result": results,
    }


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


# GET - Latest Stock Price
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

    # Fetch quote from the appropriate provider
    try:
        quote = get_stock_quote(stock.symbol)

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail="Market data provider rejected the quote request",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to market data provider",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Market data provider request failed",
        ) from exc

    current_price = quote.get("c")

    if current_price is None or current_price <= 0:
        raise HTTPException(
            status_code=404,
            detail="Latest stock price is not available",
        )

    quote_timestamp = quote.get("t")

    recorded_at = (
        datetime.fromtimestamp(
            quote_timestamp,
            tz=timezone.utc,
        )
        if quote_timestamp
        else datetime.now(timezone.utc)
    )

    existing_price = (
        db.query(StockPrice)
        .filter(
            StockPrice.stock_id == stock.id,
            StockPrice.recorded_at == recorded_at,
        )
        .first()
    )

    open_price = (
        Decimal(str(quote["o"]))
        if quote.get("o") is not None
        else None
    )

    high_price = (
        Decimal(str(quote["h"]))
        if quote.get("h") is not None
        else None
    )

    low_price = (
        Decimal(str(quote["l"]))
        if quote.get("l") is not None
        else None
    )

    if existing_price:
        existing_price.price = Decimal(str(current_price))
        existing_price.open_price = open_price
        existing_price.high_price = high_price
        existing_price.low_price = low_price

        try:
            db.commit()
            db.refresh(existing_price)
        except Exception:
            db.rollback()
            raise

        return existing_price

    price_record = StockPrice(
        stock_id=stock.id,
        price=Decimal(str(current_price)),
        open_price=open_price,
        high_price=high_price,
        low_price=low_price,
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


# GET - Historical Stock Candles
@router.get("/{symbol}/history", response_model=list[dict])
def get_stock_price_history(
    symbol: str,
    resolution: str = Query(default="D"),
    period: str = Query(default="1mo"),
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

    try:
        candles = get_stock_candles(
            symbol=stock.symbol,
            resolution=resolution,
            period=period,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Historical market data provider request failed",
        ) from exc

    try:
        for candle in candles:
            recorded_at = datetime.fromtimestamp(
                candle["time"],
                tz=timezone.utc,
            )

            existing_candle = (
                db.query(HistoricalCandle)
                .filter(
                    HistoricalCandle.stock_id == stock.id,
                    HistoricalCandle.resolution == resolution,
                    HistoricalCandle.recorded_at == recorded_at,
                )
                .first()
            )

            if existing_candle:
                existing_candle.open_price = Decimal(str(candle["open"]))
                existing_candle.high_price = Decimal(str(candle["high"]))
                existing_candle.low_price = Decimal(str(candle["low"]))
                existing_candle.close_price = Decimal(str(candle["close"]))
                existing_candle.volume = candle["volume"]

            else:
                historical_candle = HistoricalCandle(
                    stock_id=stock.id,
                    resolution=resolution,
                    open_price=Decimal(str(candle["open"])),
                    high_price=Decimal(str(candle["high"])),
                    low_price=Decimal(str(candle["low"])),
                    close_price=Decimal(str(candle["close"])),
                    volume=candle["volume"],
                    recorded_at=recorded_at,
                )

                db.add(historical_candle)

        db.commit()

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save historical candles",
        ) from exc

    return candles


# GET - Historical Candles from Database
@router.get("/{symbol}/history/db", response_model=list[dict])
def get_saved_stock_history(
    symbol: str,
    resolution: str = Query(default="D"),
    limit: int = Query(default=500, ge=1, le=5000),
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

    candles = (
        db.query(HistoricalCandle)
        .filter(
            HistoricalCandle.stock_id == stock.id,
            HistoricalCandle.resolution == resolution,
        )
        .order_by(HistoricalCandle.recorded_at.asc())
        .limit(limit)
        .all()
    )

    return [
        {
            "time": int(candle.recorded_at.timestamp()),
            "open": float(candle.open_price),
            "high": float(candle.high_price),
            "low": float(candle.low_price),
            "close": float(candle.close_price),
            "volume": candle.volume,
        }
        for candle in candles
    ]
