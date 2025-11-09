# Python FastAPI entry point for the backend

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict, recommend, health
from app.routes import geo
from app.routes import weather, risk_heatmap

app = FastAPI()

# Enable CORS for local dev and potential external frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(predict.router, prefix="/api")
app.include_router(recommend.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(geo.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(risk_heatmap.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Traffic Forecast API"}