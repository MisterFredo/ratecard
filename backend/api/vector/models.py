from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# REQUESTS
# ============================================================

class VectorBatchRequest(BaseModel):
    ids: List[str]


# ============================================================
# RESPONSES
# ============================================================

class VectorSingleResponse(BaseModel):
    status: str
    id: str
    nb_vectors: int


class VectorBatchItem(BaseModel):
    id: str
    status: str
    error: Optional[str] = None


class VectorBatchResponse(BaseModel):
    status: str
    results: List[VectorBatchItem]
