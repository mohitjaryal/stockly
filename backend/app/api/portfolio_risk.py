from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.portfolio import build_holdings_response
from app.core.security import get_current_user
from app.db.session import SessionLocal
from app.models import User

router = APIRouter(prefix="/portfolio", tags=["Portfolio Risk"])

ZERO = Decimal("0")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/risk")
def get_portfolio_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    holdings = build_holdings_response(db, current_user.id)

    groups = defaultdict(list)
    unpriced = []

    for holding in holdings:
        symbol = holding.symbol.upper()
        currency = "INR" if symbol.endswith((".NS", ".BO")) else "USD"

        if holding.current_value is None:
            unpriced.append({
                "symbol": holding.symbol,
                "company_name": holding.company_name,
            })
            continue

        value = Decimal(str(holding.current_value))

        if value > ZERO:
            groups[currency].append({
                "symbol": holding.symbol,
                "company_name": holding.company_name,
                "current_value": value,
            })

    currency_reports = []

    for currency, items in groups.items():
        total = sum(
            (item["current_value"] for item in items),
            ZERO,
        )

        allocations = []

        for item in items:
            percentage = (
                item["current_value"] / total * 100
                if total > ZERO else ZERO
            )

            allocations.append({
                "symbol": item["symbol"],
                "company_name": item["company_name"],
                "current_value": round(item["current_value"], 2),
                "allocation_percentage": round(percentage, 2),
                "risk_level": (
                    "High" if percentage >= 40
                    else "Moderate" if percentage >= 20
                    else "Low"
                ),
            })

        allocations.sort(
            key=lambda item: item["allocation_percentage"],
            reverse=True,
        )

        # Herfindahl-based diversification indicator.
        hhi = sum(
            (item["allocation_percentage"] / 100) ** 2
            for item in allocations
        )

        score = (
            (1 - float(hhi)) * 100
            if len(allocations) > 1 else 0
        )

        score = max(0, min(100, round(score, 2)))

        highest = allocations[0] if allocations else None

        warnings = []

        if highest and highest["allocation_percentage"] >= 40:
            warnings.append(
                f'{highest["symbol"]} has high portfolio concentration.'
            )

        if len(allocations) < 3:
            warnings.append(
                "Portfolio has fewer than 3 priced holdings."
            )

        currency_reports.append({
            "currency": currency,
            "total_current_value": round(total, 2),
            "holdings_count": len(allocations),
            "diversification_score": score,
            "highest_concentration": highest,
            "allocations": allocations,
            "warnings": warnings,
        })

    return {
        "currency_reports": currency_reports,
        "unpriced_holdings": unpriced,
        "unpriced_holdings_count": len(unpriced),
        "disclaimer": (
            "Diversification score is an informational concentration "
            "indicator, not a prediction of investment risk or returns."
        ),
    }
