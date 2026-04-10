from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List


# =========================================================
# CREATE USER
# =========================================================

class CreateUserPayload(BaseModel):
    email: EmailStr
    password: str

    name: Optional[str] = None
    company: Optional[str] = None
    language: Optional[str] = "fr"

    # 🔥 important → éviter List = []
    universes: List[str] = Field(default_factory=list)

    # 🔥 préparation future (admin / user)
    role: Optional[str] = "user"


# =========================================================
# LOGIN
# =========================================================

class LoginPayload(BaseModel):
    email: EmailStr
    password: str


# =========================================================
# UPDATE USER
# =========================================================

class UpdateUserPayload(BaseModel):
    user_id: str

    name: Optional[str] = None
    company: Optional[str] = None
    language: Optional[str] = "fr"

    universes: List[str] = Field(default_factory=list)

    # 🔥 permet de gérer admin plus tard
    role: Optional[str] = None


# =========================================================
# ASSIGN UNIVERS (optionnel / interne)
# =========================================================

class AssignUniversePayload(BaseModel):
    user_id: str
    universes: List[str] = Field(default_factory=list)
