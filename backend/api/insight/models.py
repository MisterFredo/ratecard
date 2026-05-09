from pydantic import BaseModel
from typing import List


# ============================================================
# REQUEST
# ============================================================

class InsightRequest(BaseModel):
    ids: List[str]


# ============================================================
# RESPONSE
# ============================================================

class InsightResponse(BaseModel):
    status: str
    insight: str
