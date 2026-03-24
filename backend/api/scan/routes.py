from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from core.scan.service import get_news_by_ids, build_scan_payload

router = APIRouter()


class ScanRequest(BaseModel):
    ids: List[str]


@router.post("/news")
def scan_news(payload: ScanRequest):
    try:
        items = get_news_by_ids(payload.ids)
        return build_scan_payload(items)
    except Exception as e:
        raise HTTPException(400, f"Erreur scan : {e}")
