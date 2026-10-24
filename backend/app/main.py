
from fastapi import FastAPI

app = FastAPI(title="Stockly API")


@app.get("/")
def root():
    return {"message": "Stockly API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
