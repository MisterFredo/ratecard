from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from core.insights.service import get_contents_by_ids, build_insight_payload, generate_insights

router = APIRouter()


class InsightRequest(BaseModel):
    ids: List[str]


@router.post("/content")
def generate_insights_route(payload: InsightRequest):
    items = get_contents_by_ids(payload.ids)
    result = generate_insights(items)
    return {"result": result}
