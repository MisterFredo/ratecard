# backend/api/axes/models.py

from pydantic import BaseModel
from typing import Optional

class AxeCreate(BaseModel):
    label: str
    description: Optional[str] = None
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class AxeUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
    media_rectangle_id: Optional[str] = None
    media_square_id: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    is_active: Optional[bool] = None
