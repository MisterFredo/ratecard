from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any


# ============================================================
# REQUEST
# ============================================================

class InsightRequest(BaseModel):
    ids: List[str]

    # 🔥 plus propre → pas besoin de Optional
    mode: Literal["preview", "insight"] = "preview"


# ============================================================
# RESPONSE — PREVIEW
# ============================================================

class InsightPreviewResponse(BaseModel):
    status: str
    mode: Literal["preview"]

    items: List[Dict[str, Any]]
    email: str


# ============================================================
# RESPONSE — INSIGHT
# ============================================================

class InsightResponse(BaseModel):
    status: str
    mode: Literal["insight"]

    items: List[Dict[str, Any]]
    email: str

    insight: str
    final_email: str
