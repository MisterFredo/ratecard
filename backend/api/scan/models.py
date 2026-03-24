from pydantic import BaseModel
from typing import List


class ScanRequest(BaseModel):
    ids: List[str]
