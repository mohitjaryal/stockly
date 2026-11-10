
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(
    prefix="/mutual-funds",
    tags=["Mutual Funds"],
)

MFAPI_BASE_URL = "https://api.mfapi.in/mf"
NAV_STALE_AFTER_DAYS = 7


def fetch_fund_data(scheme_code: int):
    try:
        response = httpx.get(
            f"{MFAPI_BASE_URL}/{scheme_code}",
            timeout=15.0,
        )
        response.raise_for_status()
        payload = response.json()

    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail="Mutual fund provider timed out",
        ) from exc

    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Mutual fund not found",
            ) from exc

        raise HTTPException(
            status_code=502,
            detail="Mutual fund provider returned an error",
        ) from exc

    except (httpx.RequestError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve mutual fund data",
        ) from exc

    meta = payload.get("meta") or {}
    nav_history = payload.get("data") or []

    if not meta or not nav_history:
        raise HTTPException(
            status_code=404,
            detail="Mutual fund NAV data is unavailable",
        )

    return meta, nav_history


def parse_nav(record: dict):
    try:
        nav = Decimal(str(record["nav"]))
        nav_date = datetime.strptime(
            record["date"],
            "%d-%m-%Y",
        ).date()

        if not nav.is_finite() or nav <= 0:
            return None

        return {
            "date": nav_date.isoformat(),
            "nav": float(nav),
        }

    except (KeyError, ValueError, InvalidOperation, TypeError):
        return None


def get_latest_valid_nav(history: list):
    valid_records = []

    for record in history:
        parsed = parse_nav(record)

        if parsed:
            valid_records.append(parsed)

    if not valid_records:
        return None

    return max(
        valid_records,
        key=lambda item: item["date"],
    )


def get_nav_freshness(nav_date: str):
    parsed_date = date.fromisoformat(nav_date)
    age_days = (date.today() - parsed_date).days

    if age_days < 0:
        status = "future_dated"
        is_stale = False
    elif age_days > NAV_STALE_AFTER_DAYS:
        status = "stale"
        is_stale = True
    else:
        status = "fresh"
        is_stale = False

    return {
        "nav_age_days": age_days,
        "is_stale": is_stale,
        "data_status": status,
    }


@router.get("/search")
def search_mutual_funds(
    q: str = Query(..., min_length=2, max_length=100),
):
    query = q.strip()

    if len(query) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter at least 2 characters",
        )

    try:
        response = httpx.get(
            f"{MFAPI_BASE_URL}/search",
            params={"q": query},
            timeout=15.0,
        )
        response.raise_for_status()
        results = response.json()

    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail="Mutual fund search timed out",
        ) from exc

    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Mutual fund search provider is unavailable",
        ) from exc

    if not isinstance(results, list):
        raise HTTPException(
            status_code=502,
            detail="Invalid mutual fund search response",
        )

    return {
        "count": len(results),
        "results": results[:50],
    }


@router.get("/{scheme_code}/nav")
def get_latest_nav(scheme_code: int):
    meta, history = fetch_fund_data(scheme_code)

    latest = get_latest_valid_nav(history)

    if latest is None:
        raise HTTPException(
            status_code=404,
            detail="Valid NAV is not available",
        )

    freshness = get_nav_freshness(latest["date"])

    return {
        "scheme_code": meta.get("scheme_code", scheme_code),
        "scheme_name": meta.get("scheme_name"),
        "fund_house": meta.get("fund_house"),
        "scheme_type": meta.get("scheme_type"),
        "scheme_category": meta.get("scheme_category"),
        "latest_nav": latest["nav"],
        "nav_date": latest["date"],
        "currency": "INR",
        **freshness,
    }


@router.get("/{scheme_code}/history")
def get_nav_history(
    scheme_code: int,
    from_date: str | None = Query(default=None),
    to_date: str | None = Query(default=None),
):
    start = None
    end = None

    try:
        if from_date:
            start = datetime.strptime(
                from_date, "%Y-%m-%d"
            ).date()

        if to_date:
            end = datetime.strptime(
                to_date, "%Y-%m-%d"
            ).date()

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="Dates must use YYYY-MM-DD format",
        ) from exc

    if start and end and start > end:
        raise HTTPException(
            status_code=400,
            detail="from_date cannot be after to_date",
        )

    meta, history = fetch_fund_data(scheme_code)

    records = []

    for item in history:
        parsed = parse_nav(item)

        if parsed is None:
            continue

        nav_date = date.fromisoformat(parsed["date"])

        if start and nav_date < start:
            continue

        if end and nav_date > end:
            continue

        records.append(parsed)

    records.sort(key=lambda item: item["date"])

    return {
        "scheme_code": meta.get("scheme_code", scheme_code),
        "scheme_name": meta.get("scheme_name"),
        "count": len(records),
        "history": records,
    }
