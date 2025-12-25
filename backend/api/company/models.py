# backend/api/company/models.py

from pydantic import BaseModel
from typing import Optional


class CompanyCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    logo_square_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    description: Optional[str] = None


class CompanyOut(BaseModel):
    id_company: str
    name: str
    logo_url: Optional[str]
    logo_square_url: Optional[str]
    linkedin_url: Optional[str]
    description: Optional[str]
