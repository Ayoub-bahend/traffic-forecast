# Schema for prediction response

from pydantic import BaseModel

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float