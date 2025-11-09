from typing import Dict
import httpx
from datetime import datetime

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def normalize_to_hour_iso(ts: str) -> str:
    # Expect ts like YYYY-MM-DDTHH:mm; normalize to YYYY-MM-DDTHH:00
    try:
        dt = datetime.fromisoformat(ts)
    except Exception:
        # Best effort: trim minutes if malformed
        return ts
    return dt.replace(minute=0, second=0, microsecond=0).isoformat(timespec="minutes")

async def fetch_weather(lat: float, lng: float, time_iso: str) -> Dict[str, float]:
    time_hour = normalize_to_hour_iso(time_iso)
    params = {
        "latitude": str(lat),
        "longitude": str(lng),
        "hourly": "temperature_2m,precipitation",
        "start": time_hour,
        "end": time_hour,
        "timezone": "Europe/Berlin"
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(OPEN_METEO_URL, params=params)
        r.raise_for_status()
        data = r.json()
    times = data.get("hourly", {}).get("time", [])
    temps = data.get("hourly", {}).get("temperature_2m", [])
    precs = data.get("hourly", {}).get("precipitation", [])
    if not times:
        raise RuntimeError("No weather data")
    try:
        idx = times.index(time_hour)
    except ValueError:
        # If exact hour not present, fallback to first entry
        idx = 0
    temperature = float(temps[idx])
    precipitation = float(precs[idx])
    return {"temperature": temperature, "precipitation": precipitation, "time": times[idx]}


