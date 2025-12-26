from pydantic import BaseModel
from typing import Optional


class AxeCreate(BaseModel):
    type: str
    label: str
    visuel_url: Optional[str] = None
    visuel_square_url: Optional[str] = None


class AxeUpdate(BaseModel):
    type: str
    label: str
    visuel_url: Optional[str] = None
    visuel_square_url: Optional[str] = None
