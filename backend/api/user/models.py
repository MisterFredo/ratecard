from pydantic import BaseModel
from typing import Optional, List


class CreateUserPayload(BaseModel):
    email: str
    name: Optional[str] = None
    company: Optional[str] = None
    language: Optional[str] = "fr"


class AssignUniversePayload(BaseModel):
    user_id: str
    universes: List[str]

class LoginPayload(BaseModel):
    email: str
    password: str
