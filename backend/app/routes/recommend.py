from fastapi import APIRouter, Query
from typing import List

router = APIRouter()


@router.get("/recommend")
def get_recommendations(top_k: int = Query(3, ge=1, le=10)) -> List[str]:
    # Placeholder recommendations
    return [f"route_{i+1}" for i in range(top_k)]


