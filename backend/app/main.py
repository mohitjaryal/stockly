
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.stocks import router as stocks_router
from app.api.auth import router as auth_router
from app.api.alerts import router as alerts_router
from app.api.watchlist import router as watchlist_router


app = FastAPI(title="Stockly API")

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
