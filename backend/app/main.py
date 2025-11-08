# Python FastAPI entry point for the backend

from fastapi import FastAPI
from app.routes import predict, recommend, health

app = FastAPI()

# Include routes
app.include_router(predict.router, prefix="/api")
app.include_router(recommend.router, prefix="/api")
app.include_router(health.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Traffic Forecast API"}