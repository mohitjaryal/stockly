
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Stock
from app.schemas.stock import StockCreate, StockResponse

router = APIRouter(prefix="/stocks", tags=["Stocks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=StockResponse, status_code=201)
def create_stock(stock_data: StockCreate, db: Session = Depends(get_db)):
    symbol = stock_data.symbol.strip().upper()

    existing_stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if existing_stock:
        raise HTTPException(status_code=409, detail="Stock already exists")

    stock = Stock(
        symbol=symbol,
        company_name=stock_data.company_name,
        exchange=stock_data.exchange,
    )
    db.add(stock)
    db.commit()
    db.refresh(stock)
    return stock


@router.get("/", response_model=list[StockResponse])
def list_stocks(db: Session = Depends(get_db)):
    return db.query(Stock).order_by(Stock.symbol).all()


@router.get("/{symbol}", response_model=StockResponse)
def get_stock(symbol: str, db: Session = Depends(get_db)):
    stock = (
        db.query(Stock)
        .filter(Stock.symbol == symbol.strip().upper())
        .first()
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )

    return stock