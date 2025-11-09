from functools import lru_cache
from shapely.geometry import shape, Point
from typing import Any, Dict, Optional, cast
import json

@lru_cache(maxsize=1)
def load_fc() -> Dict[str, Any]:
    # Use the BKG municipalities dataset you placed in backend/app/data
    # Example filename: vg250_gem.geojson (FeatureCollection with properties.AGS and properties.GEN)
    # If you prefer a different filename (e.g., ags.geojson), update this path accordingly.
    path = "/app/app/data/vg250_gem.geojson"
    with open(path, "r", encoding="utf-8") as f:
        return cast(Dict[str, Any], json.load(f))

def lookup_by_point(lat: float, lng: float) -> Optional[Dict[str, Any]]:
    fc = load_fc()
    p = Point(lng, lat)
    for feature in fc.get("features", []):
        geom = shape(feature.get("geometry"))
        if geom.contains(p):
            return feature
    return None

