from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class UniverseOut(BaseModel):
    id_universe: str
    label: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        extra = "forbid"


class UniverseListOut(BaseModel):
    status: str
    universes: List[UniverseOut]

    class Config:
        extra = "forbid"
