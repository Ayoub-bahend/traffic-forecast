from typing import Dict, Any
from datetime import datetime
from .model_loader import load_model
import pandas as pd

FEATURE_LIST = [
    "state_code", "year", "month", "weekday", "hour",
    "region_code", "district_code", "municipality_code",
    "tavg", "prcp",
    "is_weekend", "is_rush_hour",
    "is_night", "is_morning", "is_afternoon", "is_evening",
    "is_winter", "is_summer", "is_autumn", "is_spring"
]

def _time_flags(ts_iso: str) -> Dict[str, int]:
    dt = datetime.fromisoformat(ts_iso)
    year = dt.year
    month = dt.month
    weekday = dt.isoweekday()  # 1..7
    hour = dt.hour
    flags = {
        "year": year,
        "month": month,
        "weekday": weekday,
        "hour": hour,
        "is_weekend": int(weekday in [6, 7]),
        "is_rush_hour": int(hour in [7,8,9,16,17,18]),
        "is_night": int(hour in [0,1,2,3,4,5]),
        "is_morning": int(hour in [6,7,8,9,10,11]),
        "is_afternoon": int(hour in [12,13,14,15,16,17]),
        "is_evening": int(hour in [18,19,20,21,22,23]),
        "is_winter": int(month in [12,1,2]),
        "is_summer": int(month in [6,7,8]),
        "is_autumn": int(month in [9,10,11]),
        "is_spring": int(month in [3,4,5]),
    }
    return flags

def build_feature_vector(payload: Dict[str, Any]) -> Dict[str, Any]:
    # payload expects: state_code, region_code, district_code, municipality_code, timestamp, tavg, prcp
    flags = _time_flags(payload["timestamp"])
    fv: Dict[str, Any] = {
        "state_code": int(payload["state_code"]),
        "region_code": int(payload["region_code"]),
        "district_code": int(payload["district_code"]),
        "municipality_code": int(payload["municipality_code"][-3:]) if len(payload["municipality_code"])>=3 else int(payload["municipality_code"]),
        "tavg": float(payload["tavg"]),
        "prcp": float(payload["prcp"]),
        **flags
    }
    return fv

def infer_accident_count(fv: Dict[str, Any]) -> float:
    model = load_model()
    # Build a DataFrame with the exact same column names used at training time
    row = [fv[k] for k in FEATURE_LIST]
    X = pd.DataFrame([row], columns=FEATURE_LIST)
    y = model.predict(X)
    return float(y[0])

def derive_outputs(accident_count: float, tavg: float, prcp: float) -> Dict[str, Any]:
    # Simple heuristic mappings (placeholder)
    risk_percentage = max(0.0, min(100.0, accident_count * 5.0))
    congestion_level = "low"
    if risk_percentage >= 70:
        congestion_level = "high"
    elif risk_percentage >= 40:
        congestion_level = "medium"
    avg_speed_reduction = min(30.0, risk_percentage * 0.3)  # upto 30%
    visibility = "low" if prcp >= 2.0 else ("medium" if prcp >= 0.5 else "high")
    return {
        "risk_percentage": round(risk_percentage, 1),
        "congestion_level": congestion_level,
        "avg_speed_reduction": round(avg_speed_reduction, 1),
        "visibility": visibility
    }


