from functools import lru_cache
from typing import Any
import os
import pickle

# Default path (docker-compose will mount this by default)
DEFAULT_PATHS = [
    os.environ.get("MODEL_PATH", ""),              # explicit env override
    "/app/backend/model.pkl",                      # file mounted as a single volume
    "/app/app/models/model.pkl",                   # conventional models folder inside app
    "/app/app/model.pkl"                           # fallback
]

def _first_existing(paths: list[str]) -> str:
    for p in paths:
        if p and os.path.exists(p):
            return p
    raise FileNotFoundError(f"Model file not found in any of: {paths}")

@lru_cache(maxsize=1)
def load_model() -> Any:
    path = _first_existing(DEFAULT_PATHS)
    # Prefer joblib if available (sklearn models)
    try:
        import joblib  # type: ignore
        model = joblib.load(path)
    except Exception:
        with open(path, "rb") as f:
            model = pickle.load(f)
    return model


