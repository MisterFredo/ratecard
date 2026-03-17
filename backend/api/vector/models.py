from pydantic import BaseModel
from typing import List


class VectorBatchRequest(BaseModel):
    ids: List[str]

class VectorSingleResponse(BaseModel):
    status: str
    news_id: str
    nb_vectors: int


class VectorBatchResponse(BaseModel):
    status: str
    results: List[dict]
