# Schema for prediction request

from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    state_code: str = Field(min_length=2, max_length=2)
    region_code: str = Field(min_length=1, max_length=1)
    district_code: str = Field(min_length=2, max_length=2)
    municipality_code: str = Field(min_length=3, max_length=3)
    timestamp: str  # ISO local: YYYY-MM-DDTHH:mm