
import logging
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from app.db.session import SessionLocal
from app.models import Alert, Stock
from app.services.market_data import get_stock_quote
from app.algorithms.price_alert_heap import PriceAlertHeap

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

        # Group alerts by stock and condition
        grouped_alerts = {}

        for alert in alerts:
            symbol = alert.stock.symbol

            if symbol not in grouped_alerts:
                grouped_alerts[symbol] = {
                    "above": [],
                    "below": [],
                }

            if alert.condition in ("above", "below"):
                grouped_alerts[symbol][alert.condition].append(alert)
            else:
                logger.warning(
                    "Unknown alert condition for alert ID %s",
                    alert.id,
                )

        triggered_count = 0

        for symbol, conditions in grouped_alerts.items():

            # Fetch only one quote per stock
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

            except (InvalidOperation, ValueError) as exc:
                logger.warning(
                    "Skipping alerts for %s: %s",
                    symbol,
                    exc,
                )
                continue

            except Exception as exc:
                logger.warning(
                    "Quote fetch failed for %s: %s",
                    symbol,
                    exc,
                )
                continue

            # Build custom Min Heap and Max Heap
            above_heap = PriceAlertHeap("above", conditions["above"])
            below_heap = PriceAlertHeap("below", conditions["below"])

            # Trigger eligible 'above' alerts
            while (
                not above_heap.is_empty()
                and current_price >= Decimal(
                    str(above_heap.peek().target_price)
                )
            ):
                alert = above_heap.pop()
                alert.status = "triggered"
                alert.triggered_at = datetime.now(timezone.utc)
                triggered_count += 1

            # Trigger eligible 'below' alerts
            while (
                not below_heap.is_empty()
                and current_price <= Decimal(
                    str(below_heap.peek().target_price)
                )
            ):
                alert = below_heap.pop()
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
