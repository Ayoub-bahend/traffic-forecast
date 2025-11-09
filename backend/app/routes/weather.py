from fastapi import APIRouter, Query, HTTPException
from typing import Dict
from app.services.weather import fetch_weather

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("")
async def get_weather(lat: float = Query(...), lng: float = Query(...), time: str = Query(...)) -> Dict[str, float | str]:
    try:
        data = await fetch_weather(lat, lng, time)
        return {
            "temperature": data["temperature"],
            "precipitation": data["precipitation"],
            "time": data["time"],
            "lat": lat,
            "lng": lng
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Erreur API météo")


