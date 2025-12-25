# backend/api/person/models.py

from pydantic import BaseModel
from typing import Optional


class PersonCreate(BaseModel):
    id_company: str
    name: str
    title: Optional[str] = None
    profile_picture_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class PersonOut(BaseModel):
    id_person: str
    id_company: str
    name: str
    title: Optional[str] = None
    profile_picture_url: Optional[str] = None
    linkedin_url: Optional[str] = None
