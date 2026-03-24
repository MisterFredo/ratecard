from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from core.insights.service import get_contents_by_ids, build_insight_payload

router = APIRouter()


class InsightRequest(BaseModel):
    ids: List[str]


@router.post("/content")
def generate_insights(payload: InsightRequest):
    try:
        items = get_contents_by_ids(payload.ids)
        return build_insight_payload(items)
    except Exception as e:
        raise HTTPException(400, f"Erreur insights : {e}")
