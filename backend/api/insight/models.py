from pydantic import BaseModel
from typing import List, Optional, Literal


# ============================================================
# REQUEST
# ============================================================

class InsightRequest(BaseModel):
    ids: List[str]

    # 🔥 mode d’utilisation
    mode: Optional[Literal["preview", "insight"]] = "preview"


# ============================================================
# RESPONSE (optionnel mais propre)
# ============================================================

class InsightPreviewResponse(BaseModel):
    status: str
    mode: str
    items: List[dict]
    email: Optional[str] = None


class InsightLLMResponse(BaseModel):
    status: str
    mode: str
    result: str
