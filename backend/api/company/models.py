from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    logo_square_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None    # ← OPTION FUTUR
    description: Optional[str] = None


class CompanyOut(BaseModel):
    id_company: str
    name: str
    logo_url: Optional[str]
    logo_square_url: Optional[str]
    linkedin_url: Optional[str]
    website_url: Optional[str]            # ← OPTION FUTUR
    description: Optional[str]

    created_at: Optional[datetime] = None  # ← RECOMMANDÉ
    updated_at: Optional[datetime] = None  # ← RECOMMANDÉ
