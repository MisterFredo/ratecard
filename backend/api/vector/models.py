from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# REQUESTS
# ============================================================

class VectorBatchRequest(BaseModel):
    ids: List[str]


# ============================================================
# NEWS
# ============================================================

class VectorNewsResponse(BaseModel):
    status: str
    news_id: str
    nb_vectors: int


class VectorNewsBatchItem(BaseModel):
    news_id: str
    status: str
    error: Optional[str] = None


class VectorNewsBatchResponse(BaseModel):
    status: str
    results: List[VectorNewsBatchItem]


# ============================================================
# CONTENT
# ============================================================

class VectorContentResponse(BaseModel):
    status: str
    content_id: str
    nb_vectors: int


class VectorContentBatchItem(BaseModel):
    content_id: str
    status: str
    error: Optional[str] = None


class VectorContentBatchResponse(BaseModel):
    status: str
    results: List[VectorContentBatchItem]
