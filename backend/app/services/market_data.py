
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
BASE_URL = "https://finnhub.io/api/v1"


def get_stock_quote(symbol: str):
    if not FINNHUB_API_KEY:
        raise ValueError("FINNHUB_API_KEY missing in .env")

    response = httpx.get(
        f"{BASE_URL}/quote",
        params={"symbol": symbol.upper()},
        headers={"X-Finnhub-Token": FINNHUB_API_KEY},
        timeout=10,
    )

    response.raise_for_status()
    return response.json()
