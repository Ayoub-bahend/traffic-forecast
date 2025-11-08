# Schema for prediction request

from pydantic import BaseModel

class PredictionRequest(BaseModel):
    location: str
    time: str