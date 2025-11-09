from fastapi import APIRouter, Query
from typing import Dict
from app.services.ags_lookup import lookup_by_point, load_fc

router = APIRouter(prefix="/geo", tags=["geo"])

@router.get("/resolve")
async def resolve(lat: float = Query(...), lng: float = Query(...)) -> Dict[str, str]:
    try:
        feat = lookup_by_point(lat, lng)
    except Exception:
        # Dataset missing/corrupted
        return {"error": "dataset_invalid_or_missing"}
    if not feat:
        return {"error": "outside_germany"}
    props = feat.get("properties", {})
    ags = str(props.get("AGS") or "")
    if len(ags) != 8 or not ags.isdigit():
        return {"error": "invalid_feature"}
    return {
        "ags": ags,
        "state_code": ags[0:2],
        "region_code": ags[2],
        "district_code": ags[3:5],
        "municipality_code": ags[5:8],
        "name": props.get("GEN"),
    }

@router.get("/health")
async def geo_health() -> Dict[str, str]:
    try:
        fc = load_fc()
        n = len(fc.get("features", []))
        return {"status": "ok", "features": str(n)}
    except FileNotFoundError:
        return {"status": "error", "error": "dataset_missing"}
    except Exception:
        return {"status": "error", "error": "dataset_invalid"}


