from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List



router = APIRouter()


class InsightRequest(BaseModel):
    ids: List[str]


@router.post("/content")
def generate_insights_route(payload: InsightRequest):
    items = get_contents_by_ids(payload.ids)
    result = generate_insights(items)
    return {"result": result}
