from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from core.scan.service import get_news_by_ids, build_scan_payload, generate_scan

router = APIRouter()


class ScanRequest(BaseModel):
    ids: List[str]


@router.post("/news")
def scan_news(payload: ScanRequest):
    items = get_news_by_ids(payload.ids)
    result = generate_scan(items)
    return {"result": result}




