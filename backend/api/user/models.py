from pydantic import BaseModel, EmailStr
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

    universes: List[str] = []  # 🔥 clé ajout


# =========================================================
# ASSIGN UNIVERS (si besoin séparé)
# =========================================================

class AssignUniversePayload(BaseModel):
    user_id: str
    universes: List[str]


# =========================================================
# LOGIN
# =========================================================

class LoginPayload(BaseModel):
    email: EmailStr
    password: str
