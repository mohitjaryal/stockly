
import logging
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from app.db.session import SessionLocal
from app.models import Alert, Stock
from app.services.market_data import get_stock_quote

logger = logging.getLogger(__name__)


def check_active_alerts():
    db = SessionLocal()

    try:
        alerts = (
            db.query(Alert)
            .join(Stock, Alert.stock_id == Stock.id)
            .filter(Alert.status == "active")
            .all()
        )

        quotes = {}
        triggered_count = 0

        for alert in alerts:
            symbol = alert.stock.symbol

            # Fetch only one quote per stock.
            if symbol not in quotes:
                try:
                    quote = get_stock_quote(symbol)

                    if not isinstance(quote, dict):
                        raise ValueError("Invalid quote response")

                    raw_price = quote.get("c")

                    if raw_price is None:
                        raise ValueError("Quote does not contain current price")

                    current_price = Decimal(str(raw_price))

                    if not current_price.is_finite() or current_price <= 0:
                        raise ValueError("Invalid or non-positive stock price")

                    quotes[symbol] = current_price

                except (InvalidOperation, ValueError) as exc:
                    logger.warning(
                        "Skipping alerts for %s: %s",
                        symbol,
                        exc,
                    )
                    quotes[symbol] = None

                except Exception as exc:
                    logger.warning(
                        "Quote fetch failed for %s: %s",
                        symbol,
                        exc,
                    )
                    quotes[symbol] = None

            current_price = quotes[symbol]

            # Skip this stock if its quote could not be fetched.
            if current_price is None:
                continue

            target_price = Decimal(str(alert.target_price))

            should_trigger = (
                alert.condition == "above"
                and current_price >= target_price
            ) or (
                alert.condition == "below"
                and current_price <= target_price
            )

            if should_trigger:
                alert.status = "triggered"
                alert.triggered_at = datetime.now(timezone.utc)
                triggered_count += 1

        if triggered_count:
            db.commit()
            logger.info(
                "Successfully triggered %s price alerts",
                triggered_count,
            )

        return triggered_count

    except Exception:
        db.rollback()
        logger.exception("Alert monitoring failed")
        return 0

    finally:
        db.close()
