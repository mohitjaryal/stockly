
from datetime import datetime, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.api.stocks import get_db
from app.models import Stock, HistoricalCandle


def override_get_db(db):
    def _get_db():
        yield db

    return _get_db


def test_history_saves_candles(db_session):
    app.dependency_overrides[get_db] = override_get_db(db_session)

    db_session.add(
        Stock(
            symbol="AAPL",
            company_name="Apple Inc.",
            exchange="NASDAQ",
        )
    )
    db_session.commit()

    mock_candles = [
        {
            "time": 1791345600,
            "open": 336.96,
            "high": 338.67,
            "low": 332.78,
            "close": 336.67,
            "volume": 34147900,
        }
    ]

    try:
        with patch(
            "app.api.stocks.get_stock_candles",
            return_value=mock_candles,
        ):
            client = TestClient(app)
            response = client.get("/stocks/AAPL/history")

        assert response.status_code == 200

        saved = db_session.query(HistoricalCandle).all()

        assert len(saved) == 1
        assert float(saved[0].close_price) == 336.67

    finally:
        app.dependency_overrides.clear()


def test_history_does_not_create_duplicates(db_session):
    app.dependency_overrides[get_db] = override_get_db(db_session)

    db_session.add(
        Stock(
            symbol="AAPL",
            company_name="Apple Inc.",
            exchange="NASDAQ",
        )
    )
    db_session.commit()

    mock_candles = [
        {
            "time": 1791345600,
            "open": 336.96,
            "high": 338.67,
            "low": 332.78,
            "close": 336.67,
            "volume": 34147900,
        }
    ]

    try:
        with patch(
            "app.api.stocks.get_stock_candles",
            return_value=mock_candles,
        ):
            client = TestClient(app)

            client.get("/stocks/AAPL/history")
            client.get("/stocks/AAPL/history")

        saved_count = db_session.query(HistoricalCandle).count()

        assert saved_count == 1

    finally:
        app.dependency_overrides.clear()


def test_database_history_returns_saved_candles(db_session):
    app.dependency_overrides[get_db] = override_get_db(db_session)

    stock = Stock(
        symbol="AAPL",
        company_name="Apple Inc.",
        exchange="NASDAQ",
    )

    db_session.add(stock)
    db_session.commit()
    db_session.refresh(stock)

    db_session.add(
        HistoricalCandle(
            stock_id=stock.id,
            resolution="D",
            open_price=336.96,
            high_price=338.67,
            low_price=332.78,
            close_price=336.67,
            volume=34147900,
            recorded_at=datetime.fromtimestamp(
                1791345600,
                tz=timezone.utc,
            ),
        )
    )
    db_session.commit()

    try:
        client = TestClient(app)
        response = client.get("/stocks/AAPL/history/db")

        assert response.status_code == 200

        data = response.json()

        assert len(data) == 1
        assert data[0]["close"] == 336.67

    finally:
        app.dependency_overrides.clear()


def test_history_returns_404_for_unknown_stock(db_session):
    app.dependency_overrides[get_db] = override_get_db(db_session)

    try:
        client = TestClient(app)
        response = client.get("/stocks/UNKNOWN/history")

        assert response.status_code == 404

    finally:
        app.dependency_overrides.clear()
