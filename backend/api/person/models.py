from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PersonCreate(BaseModel):
    id_company: Optional[str] = None
    name: str
    title: Optional[str] = None
    description: Optional[str] = None

    media_picture_rectangle_id: Optional[str] = None
    media_picture_square_id: Optional[str] = None  # carré = principale

    linkedin_url: Optional[str] = None


class PersonOut(BaseModel):
    id_person: str
    id_company: Optional[str]

    name: str
    title: Optional[str]
    description: Optional[str]

    media_picture_rectangle_id: Optional[str]
    media_picture_square_id: Optional[str]

    linkedin_url: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    is_active: Optional[bool] = True
