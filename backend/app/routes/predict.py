# Route for traffic prediction

from fastapi import APIRouter
from app.schemas.prediction_request import PredictionRequest
from app.schemas.prediction_response import PredictionResponse
from app.services.ags_lookup import feature_by_ags
from app.services.weather import fetch_weather
from app.services.prediction_service import build_feature_vector, infer_accident_count, derive_outputs
from shapely.geometry import shape

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_traffic(data: PredictionRequest):
    """
    Predict traffic congestion based on input data.
    """
    # Build full AGS from components: LL + R + KK + GGG
    ags = f"{data.state_code}{data.region_code}{data.district_code}{data.municipality_code}"
    # Resolve centroid for municipality to query weather
    feat = feature_by_ags(ags)
    lat = 52.52
    lng = 13.405
    if feat and feat.get("geometry"):
        geom = shape(feat["geometry"])
        c = geom.centroid
        lng = float(c.x)
        lat = float(c.y)
    # Fetch weather for the requested timestamp
    weather = await fetch_weather(lat, lng, data.timestamp)
    temperature = weather["temperature"]
    precipitation = weather["precipitation"]
    # Build features and infer accident_count
    fv = build_feature_vector({
        "state_code": data.state_code,
        "region_code": data.region_code,
        "district_code": data.district_code,
        "municipality_code": data.municipality_code,
        "timestamp": data.timestamp,
        "tavg": temperature,
        "prcp": precipitation
    })
    accident_count = infer_accident_count(fv)
    derived = derive_outputs(accident_count, temperature, precipitation)
    # Map to existing response shape minimally
    predicted = derived["congestion_level"]
    confidence = min(0.99, max(0.5, derived["risk_percentage"] / 100.0))
    return {"prediction": predicted, "confidence": confidence}

@router.post("/predict/extended")
async def predict_extended(data: PredictionRequest):
    ags = f"{data.state_code}{data.region_code}{data.district_code}{data.municipality_code}"
    feat = feature_by_ags(ags)
    lat = 52.52
    lng = 13.405
    if feat and feat.get("geometry"):
        geom = shape(feat["geometry"])
        c = geom.centroid
        lng = float(c.x)
        lat = float(c.y)
    weather = await fetch_weather(lat, lng, data.timestamp)
    temperature = weather["temperature"]
    precipitation = weather["precipitation"]
    fv = build_feature_vector({
        "state_code": data.state_code,
        "region_code": data.region_code,
        "district_code": data.district_code,
        "municipality_code": data.municipality_code,
        "timestamp": data.timestamp,
        "tavg": temperature,
        "prcp": precipitation
    })
    accident_count = infer_accident_count(fv)
    derived = derive_outputs(accident_count, temperature, precipitation)
    return {
        "accident_count": accident_count,
        "temperature": temperature,
        "precipitation": precipitation,
        **derived
    }