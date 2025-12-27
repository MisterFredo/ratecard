from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None

    media_logo_rectangle_id: Optional[str] = None
    media_logo_square_id: Optional[str] = None

    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None


class CompanyOut(BaseModel):
    id_company: str
    name: str
    description: Optional[str]

    media_logo_rectangle_id: Optional[str]
    media_logo_square_id: Optional[str]

    linkedin_url: Optional[str]
    website_url: Optional[str]

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: Optional[bool] = True
