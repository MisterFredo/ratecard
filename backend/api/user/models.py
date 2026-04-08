from pydantic import BaseModel, EmailStr
from typing import Optional, List


class CreateUserPayload(BaseModel):
    email: str
    password: str  # 🔥 obligatoire maintenant
    name: Optional[str] = None
    company: Optional[str] = None
    language: Optional[str] = "fr"


class AssignUniversePayload(BaseModel):
    user_id: str
    universes: List[str]


class LoginPayload(BaseModel):
    email: str
    password: str

class CreateUserPayload(BaseModel):
    email: EmailStr
    password: str
