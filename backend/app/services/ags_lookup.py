from functools import lru_cache
from shapely.geometry import shape, Point
from typing import Any, Dict, Optional, cast
import json

@lru_cache(maxsize=1)
def load_fc() -> Dict[str, Any]:
    path = "/app/app/data/ags.geojson"
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

