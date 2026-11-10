
import os
import httpx
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
BASE_URL = "https://finnhub.io/api/v1"


def get_finnhub_headers():
    if not FINNHUB_API_KEY:
        raise ValueError("FINNHUB_API_KEY missing in .env")

    return {"X-Finnhub-Token": FINNHUB_API_KEY}


# Search stocks by company name or ticker
def search_stock_symbols(query: str, exchange: str | None = None):
    query = query.strip()

    if not query:
        raise ValueError("Search query cannot be empty")

    params = {"q": query}

    if exchange:
        params["exchange"] = exchange.upper()

    response = httpx.get(
        f"{BASE_URL}/search",
        params=params,
        headers=get_finnhub_headers(),
        timeout=10,
    )

    response.raise_for_status()

    return response.json()


# Get Latest Stock Quote from Finnhub

def get_stock_quote(symbol: str):
    symbol = symbol.strip().upper()

    # Indian stocks: use Yahoo Finance
    if symbol.endswith(".NS") or symbol.endswith(".BO"):
        ticker = yf.Ticker(symbol)

        history = ticker.history(
            period="5d",
            interval="1d",
            auto_adjust=False,
        )

        if history.empty:
            raise ValueError(
                f"No quote data available for Indian stock: {symbol}"
            )

        # Latest available trading session
        row = history.iloc[-1]
        timestamp = history.index[-1]

        return {
            "c": float(row["Close"]),
            "o": float(row["Open"]),
            "h": float(row["High"]),
            "l": float(row["Low"]),
            "t": int(timestamp.timestamp()),
        }

    # US and other supported stocks: use Finnhub
    response = httpx.get(
        f"{BASE_URL}/quote",
        params={"symbol": symbol},
        headers=get_finnhub_headers(),
        timeout=10,
    )

    response.raise_for_status()
    quote = response.json()

    if not isinstance(quote, dict):
        raise ValueError("Invalid quote response from Finnhub")

    return quote




# Get Historical Stock Candles from Yahoo Finance
def get_stock_candles(
    symbol: str,
    resolution: str = "D",
    period: str = "1mo",
):
    interval_map = {
        "1": "1m",
        "5": "5m",
        "15": "15m",
        "30": "30m",
        "60": "1h",
        "D": "1d",
        "W": "1wk",
        "M": "1mo",
    }

    interval = interval_map.get(resolution)

    if interval is None:
        raise ValueError("Unsupported resolution")

    ticker = yf.Ticker(symbol.upper())

    history = ticker.history(
        period=period,
        interval=interval,
        auto_adjust=False,
    )

    if history.empty:
        return []

    candles = []

    for timestamp, row in history.iterrows():
        candles.append({
            "time": int(timestamp.timestamp()),
            "open": round(float(row["Open"]), 4),
            "high": round(float(row["High"]), 4),
            "low": round(float(row["Low"]), 4),
            "close": round(float(row["Close"]), 4),
            "volume": int(row["Volume"]),
        })

    return candles
