
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.stocks import router as stocks_router
from app.api.auth import router as auth_router
from app.api.alerts import router as alerts_router
from app.api.watchlist import router as watchlist_router
from app.services.alert_monitor import check_active_alerts


scheduler = BackgroundScheduler(timezone="UTC")


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        check_active_alerts,
        trigger="interval",
        seconds=60,
        id="stockly_alert_monitor",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        next_run_time=datetime.now(timezone.utc),
    )

    scheduler.start()

    try:
        yield
    finally:
        scheduler.shutdown(wait=True)


app = FastAPI(
    title="Stockly API",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(stocks_router)
app.include_router(auth_router)
app.include_router(alerts_router)
app.include_router(watchlist_router)


@app.get("/")
def root():
    return {"message": "Stockly API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
