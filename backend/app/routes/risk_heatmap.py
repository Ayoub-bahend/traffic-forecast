from fastapi import APIRouter, Query
from typing import Dict, Any, List
from app.services.ags_lookup import load_fc
from app.services.weather import fetch_weather
from app.services.prediction_service import build_feature_vector, infer_accident_count, derive_outputs
from shapely.geometry import shape

router = APIRouter(prefix="/risk-heatmap", tags=["risk"])

@router.get("")
async def risk_heatmap(time: str = Query(...), limit: int = Query(400, ge=1, le=2000), stride: int = Query(25, ge=1)) -> Dict[str, Any]:
  """
  Return a GeoJSON FeatureCollection of centroids with 'risk' property for visual heatmaps.
  - time: ISO minute (YYYY-MM-DDTHH:mm)
  - limit: max features sampled
  - stride: take every 'stride'-th municipality to reduce calls
  """
  fc = load_fc()
  features = fc.get("features", [])
  out_features: List[Dict[str, Any]] = []
  taken = 0
  # Iterate municipalities sparsely to keep latency reasonable
  for i, feat in enumerate(features):
    if i % stride != 0:
      continue
    geom = feat.get("geometry")
    props = feat.get("properties", {})
    if not geom or "AGS" not in props:
      continue
    ags = str(props.get("AGS"))
    centroid = shape(geom).centroid
    lng = float(centroid.x)
    lat = float(centroid.y)
    # Weather
    try:
      w = await fetch_weather(lat, lng, time)
      tavg = w["temperature"]
      prcp = w["precipitation"]
    except Exception:
      tavg = 10.0
      prcp = 0.0
    payload = {
      "state_code": ags[0:2],
      "region_code": ags[2],
      "district_code": ags[3:5],
      "municipality_code": ags[5:8],
      "timestamp": time,
      "tavg": tavg,
      "prcp": prcp
    }
    fv = build_feature_vector(payload)
    acc = infer_accident_count(fv)
    derived = derive_outputs(acc, tavg, prcp)
    risk = float(derived["risk_percentage"])
    out_features.append({
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [lng, lat] },
      "properties": {
        "ags": ags,
        "risk": risk,
        "temperature": tavg,
        "precipitation": prcp
      }
    })
    taken += 1
    if taken >= limit:
      break
  return { "type": "FeatureCollection", "features": out_features }


