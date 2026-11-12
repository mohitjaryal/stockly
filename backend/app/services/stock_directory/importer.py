
import csv
import io
import logging
from typing import Any

import httpx
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models import StockListing


logger = logging.getLogger(__name__)


NSE_EQUITY_URL = (
    "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv"
)

NASDAQ_LISTED_URL = (
    "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt"
)

OTHER_LISTED_URL = (
    "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt"
)


# Officially recognized exchange codes in otherlisted.txt.
US_EXCHANGE_CODES = {
    "N": "NYSE",
    "A": "NYSE_AMERICAN",
    "P": "NYSE_ARCA",
    "Z": "CBOE_BZX",
    "V": "IEX",
}


def download_file(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        ),
        "Accept": "text/csv,text/plain,application/json,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.nseindia.com/",
        "Origin": "https://www.nseindia.com",
    }

    try:
        with httpx.Client(
            timeout=httpx.Timeout(60.0, connect=20.0),
            follow_redirects=True,
            headers=headers,
            http1=True,
            http2=False,
        ) as client:
            response = client.get(url)
            response.raise_for_status()

        content = response.content.decode("utf-8-sig")

        if not content.strip():
            raise ValueError(f"Downloaded file is empty: {url}")

        return content

    except (httpx.HTTPError, ValueError) as exc:
        logger.exception("Failed to download source: %s", url)
        raise RuntimeError(
            f"Could not download stock listing source: {url}"
        ) from exc


def normalize_headers(reader: csv.DictReader) -> None:
    """Remove whitespace from CSV column names."""
    if reader.fieldnames:
        reader.fieldnames = [
            name.strip() for name in reader.fieldnames
        ]


def parse_nse_listings(content: str) -> list[dict[str, Any]]:
    records = []

    reader = csv.DictReader(io.StringIO(content))
    normalize_headers(reader)

    for row in reader:
        symbol = (row.get("SYMBOL") or "").strip().upper()
        company_name = (row.get("NAME OF COMPANY") or "").strip()
        isin = (row.get("ISIN NUMBER") or "").strip() or None

        series = (row.get("SERIES") or "").strip().upper()

        if not symbol or not company_name:
            continue

        # Keep ordinary equity series only.
        if series != "EQ":
            continue

        records.append({
            "symbol": symbol,
            "company_name": company_name,
            "exchange": "NSE",
            "country": "IN",
            "currency": "INR",
            "isin": isin,
            "sector": None,
            "industry": None,
            "asset_type": "EQUITY",
            "is_active": True,
            "source": "NSE",
        })

    return records


def parse_nasdaq_listings(content: str) -> list[dict[str, Any]]:
    records = []

    reader = csv.DictReader(
        io.StringIO(content),
        delimiter="|",
    )
    normalize_headers(reader)

    for row in reader:
        symbol = (row.get("Symbol") or "").strip().upper()
        company_name = (row.get("Security Name") or "").strip()

        test_issue = (row.get("Test Issue") or "").strip().upper()
        etf_flag = (row.get("ETF") or "").strip().upper()

        if not symbol or not company_name:
            continue

        if test_issue == "Y" or etf_flag == "Y":
            continue

        records.append({
            "symbol": symbol,
            "company_name": company_name,
            "exchange": "NASDAQ",
            "country": "US",
            "currency": "USD",
            "isin": None,
            "sector": None,
            "industry": None,
            "asset_type": "EQUITY",
            "is_active": True,
            "source": "NASDAQ_TRADER",
        })

    return records


def parse_other_us_listings(content: str) -> list[dict[str, Any]]:
    records = []

    reader = csv.DictReader(
        io.StringIO(content),
        delimiter="|",
    )
    normalize_headers(reader)

    for row in reader:
        symbol = (
            row.get("ACT Symbol")
            or row.get("NASDAQ Symbol")
            or ""
        ).strip().upper()

        company_name = (row.get("Security Name") or "").strip()
        exchange_code = (row.get("Exchange") or "").strip().upper()

        test_issue = (row.get("Test Issue") or "").strip().upper()
        etf_flag = (row.get("ETF") or "").strip().upper()

        exchange = US_EXCHANGE_CODES.get(exchange_code)

        if not symbol or not company_name or not exchange:
            continue

        if test_issue == "Y" or etf_flag == "Y":
            continue

        records.append({
            "symbol": symbol,
            "company_name": company_name,
            "exchange": exchange,
            "country": "US",
            "currency": "USD",
            "isin": None,
            "sector": None,
            "industry": None,
            "asset_type": "EQUITY",
            "is_active": True,
            "source": "NASDAQ_TRADER",
        })

    return records


def deduplicate_records(
    records: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Keep one record per symbol and exchange."""
    unique_records = {}

    for record in records:
        key = (
            record["symbol"],
            record["exchange"],
        )

        existing = unique_records.get(key)

        if existing:
            # Preserve available metadata if a duplicate has it.
            for field in ("isin", "sector", "industry"):
                if not existing.get(field) and record.get(field):
                    existing[field] = record[field]
        else:
            unique_records[key] = record.copy()

    return list(unique_records.values())


def upsert_listings(
    db: Session,
    records: list[dict[str, Any]],
) -> int:
    records = deduplicate_records(records)

    if not records:
        return 0

    processed = 0

    for start in range(0, len(records), 500):
        batch = records[start:start + 500]

        statement = insert(StockListing).values(batch)

        update_values = {
            "company_name": statement.excluded.company_name,
            "country": statement.excluded.country,
            "currency": statement.excluded.currency,
            "isin": func.coalesce(
                statement.excluded.isin,
                StockListing.isin,
            ),
            "sector": func.coalesce(
                statement.excluded.sector,
                StockListing.sector,
            ),
            "industry": func.coalesce(
                statement.excluded.industry,
                StockListing.industry,
            ),
            "asset_type": statement.excluded.asset_type,
            "is_active": True,
            "source": statement.excluded.source,
            "updated_at": func.now(),
        }

        statement = statement.on_conflict_do_update(
            index_elements=["symbol", "exchange"],
            set_=update_values,
        )

        db.execute(statement)
        processed += len(batch)

    db.commit()

    return processed


def sync_stock_directory(
    db,
    include_india=True,
    include_us=True,
) -> dict:
    summary = {
        "india_processed": 0,
        "nasdaq_processed": 0,
        "other_us_processed": 0,
        "total_processed": 0,
        "unknown_us_exchange_codes": [],
        "errors": [],
    }

    if include_india:
        try:
            nse_content = download_file(NSE_EQUITY_URL)
            nse_records = parse_nse_listings(nse_content)
            summary["india_processed"] = upsert_listings(db, nse_records)
        except Exception as exc:
            db.rollback()
            logger.exception("NSE stock import failed")
            summary["errors"].append(f"NSE import failed: {exc}")

    if include_us:
        try:
            nasdaq_content = download_file(NASDAQ_LISTED_URL)
            nasdaq_records = parse_nasdaq_listings(nasdaq_content)
            summary["nasdaq_processed"] = upsert_listings(db, nasdaq_records)
        except Exception as exc:
            db.rollback()
            logger.exception("NASDAQ stock import failed")
            summary["errors"].append(f"NASDAQ import failed: {exc}")

        try:
            other_content = download_file(OTHER_LISTED_URL)

            other_reader = csv.DictReader(
                io.StringIO(other_content),
                delimiter="|",
            )
            normalize_headers(other_reader)

            unknown_codes = set()
            for row in other_reader:
                code = (row.get("Exchange") or "").strip().upper()
                if code and code not in US_EXCHANGE_CODES:
                    unknown_codes.add(code)

            summary["unknown_us_exchange_codes"] = sorted(unknown_codes)

            other_records = parse_other_us_listings(other_content)
            summary["other_us_processed"] = upsert_listings(db, other_records)

        except Exception as exc:
            db.rollback()
            logger.exception("Other US stock import failed")
            summary["errors"].append(f"Other US import failed: {exc}")

    summary["total_processed"] = (
        summary["india_processed"]
        + summary["nasdaq_processed"]
        + summary["other_us_processed"]
    )

    if summary["total_processed"] == 0 and summary["errors"]:
        raise RuntimeError("; ".join(summary["errors"]))

    return summary

