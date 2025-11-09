from __future__ import annotations

import os
import joblib
import pandas as pd
from xgboost import XGBRegressor
from typing import List

# We reuse the exact same feature order as inference to avoid mismatch
try:
    from app.services.prediction_service import FEATURE_LIST as INFER_FEATURES  # type: ignore
except Exception:
    INFER_FEATURES: List[str] = [
        "state_code", "year", "month", "weekday", "hour",
        "region_code", "district_code", "municipality_code",
        "tavg", "prcp",
        "is_weekend", "is_rush_hour",
        "is_night", "is_morning", "is_afternoon", "is_evening",
        "is_winter", "is_summer", "is_autumn", "is_spring"
    ]

DATA_PATH = os.environ.get("TRAIN_DATA_PATH", "/app/app/data/data.csv")
MODEL_PATH = os.environ.get("MODEL_PATH", "/app/backend/model.pkl")

def main() -> None:
    df = pd.read_csv(DATA_PATH)
    # Ensure features exist
    missing = [c for c in INFER_FEATURES if c not in df.columns]
    if missing:
        raise RuntimeError(f"Missing columns in training data: {missing}")
    if "accident_count" not in df.columns:
        raise RuntimeError("Missing target column 'accident_count'")

    df = df.sort_values(["year", "month", "weekday", "hour"]).reset_index(drop=True)

    test_size = 72
    training_data = df.iloc[:-test_size].copy() if len(df) > test_size else df.copy()
    # testing_data = df.iloc[-test_size:].copy() if len(df) > test_size else df.head(0).copy()

    X_train = training_data[INFER_FEATURES]
    y_train = training_data["accident_count"]

    model = XGBRegressor(
        objective="count:poisson",
        eval_metric="poisson-nloglik",
        random_state=42,
        max_depth=6,
        learning_rate=0.1,
        n_estimators=500,
        colsample_bytree=0.8,
        subsample=0.8
    )
    model.fit(X_train, y_train)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved to {MODEL_PATH}")

if __name__ == "__main__":
    main()


