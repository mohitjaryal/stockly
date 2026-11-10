
import logging
from datetime import datetime, timezone
from decimal import Decimal

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

            # Fetch one quote per stock, even if multiple alerts exist.
            if symbol not in quotes:
                try:
                    quote = get_stock_quote(symbol)
                    current_price = quote.get("c")

                    if current_price is None or current_price <= 0:
                        quotes[symbol] = None
                    else:
                        quotes[symbol] = Decimal(str(current_price))

                except Exception:
                    logger.exception(
                        "Failed to fetch quote for %s", symbol
                    )
                    quotes[symbol] = None

            current_price = quotes[symbol]

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
            logger.info("Triggered %s price alerts", triggered_count)

        return triggered_count

    except Exception:
        db.rollback()
        logger.exception("Alert monitoring failed")
        return 0

    finally:
        db.close()
