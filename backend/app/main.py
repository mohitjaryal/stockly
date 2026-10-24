
from fastapi import FastAPI
from app.api.stocks import router as stocks_router
from app.api.auth import router as auth_router


app = FastAPI(title="Stockly API")

app.include_router(stocks_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Stockly API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
