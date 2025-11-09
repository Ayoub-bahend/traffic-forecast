# Route for traffic prediction

from fastapi import APIRouter
from app.schemas.prediction_request import PredictionRequest
from app.schemas.prediction_response import PredictionResponse

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_traffic(data: PredictionRequest):
    """
    Predict traffic congestion based on input data.
    """
    # Mock response for now
    # You can use the codes to influence a mock prediction if desired
    return {"prediction": "low", "confidence": 0.95}