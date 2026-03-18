from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# COMMON REQUESTS
# ============================================================

class VectorBatchRequest(BaseModel):
    # sélection manuelle
    ids: Optional[List[str]] = None

    # mode automatique (backlog)
    limit: Optional[int] = None
    offset: Optional[int] = None

    # filtres optionnels
    status: Optional[str] = None   # ex: NOT_VECTORIZED / ERROR


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
    nb_vectors: Optional[int] = None
    error: Optional[str] = None


class VectorNewsBatchResponse(BaseModel):
    status: str
    processed: int
    success: int
    error: int
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
    nb_vectors: Optional[int] = None
    error: Optional[str] = None


class VectorContentBatchResponse(BaseModel):
    status: str
    processed: int
    success: int
    error: int
    results: List[VectorContentBatchItem]
