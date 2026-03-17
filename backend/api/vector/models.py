from pydantic import BaseModel
from typing import List


class VectorBatchRequest(BaseModel):
    ids: List[str]
