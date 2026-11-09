from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Watchlist, Stock, User
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[WatchlistResponse])
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = (
        db.query(Watchlist, Stock)
        .join(Stock, Watchlist.stock_id == Stock.id)
        .filter(Watchlist.user_id == current_user.id)
        .order_by(Watchlist.created_at.desc())
        .all()
    )

    return [
        WatchlistResponse(
            id=item.id,
            symbol=stock.symbol,
            company_name=stock.company_name,
            exchange=stock.exchange,
            created_at=item.created_at,
        )
        for item, stock in entries
    ]


@router.post("/", response_model=WatchlistResponse, status_code=201)
def add_to_watchlist(
    watchlist_data: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    symbol = watchlist_data.symbol.strip().upper()

    stock = db.query(Stock).filter(Stock.symbol == symbol).first()

    if not stock:
        raise HTTPException(
            status_code=404,
            detail=f"Stock {symbol} not found",
        )

    existing = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.stock_id == stock.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"{symbol} is already in your watchlist",
        )

    entry = Watchlist(
        user_id=current_user.id,
        stock_id=stock.id,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return WatchlistResponse(
        id=entry.id,
        symbol=stock.symbol,
        company_name=stock.company_name,
        exchange=stock.exchange,
        created_at=entry.created_at,
    )


@router.delete("/{symbol}")
def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    symbol = symbol.strip().upper()

    stock = db.query(Stock).filter(Stock.symbol == symbol).first()

    if not stock:
        raise HTTPException(
            status_code=404,
            detail=f"Stock {symbol} not found",
        )

    entry = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.stock_id == stock.id,
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail=f"{symbol} is not in your watchlist",
        )

    db.delete(entry)
    db.commit()

    return {"message": f"{symbol} removed from watchlist"}
