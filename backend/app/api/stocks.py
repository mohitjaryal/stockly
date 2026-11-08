


from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timezone
import httpx

from app.db.session import SessionLocal
from app.models import User, Stock, StockPrice, HistoricalCandle
from app.schemas.stock import StockCreate, StockResponse
from app.schemas.stock_price import StockPriceResponse
from app.core.security import require_admin
from app.services.market_data import get_stock_quote, get_stock_candles


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



# GET - Historical Stock Candles from Yahoo Finance
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

    # Fetch historical candles from Yahoo Finance
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

    # Save candles in PostgreSQL
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

# GET - Historical Candles from PostgreSQL
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