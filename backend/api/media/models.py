# backend/api/media/models.py

from pydantic import BaseModel
from typing import Optional


# ------------------------------------------------------------
# REGISTER MEDIA (payload JSON envoyé par Next.js)
# ------------------------------------------------------------
class MediaRegister(BaseModel):
    filepath: str           # ex: "/uploads/media/logos/1234_logo.jpg"
    format: str             # "square" | "rectangle" | "original"


# ------------------------------------------------------------
# ASSIGN MEDIA TO ENTITY
# ------------------------------------------------------------
class MediaAssign(BaseModel):
    media_id: str
    entity_type: str        # "company" | "person" | "axe" | "article"
    entity_id: str


# ------------------------------------------------------------
# UNASSIGN MEDIA (remove binding)
# ------------------------------------------------------------
class MediaUnassign(BaseModel):
    media_id: str


# ------------------------------------------------------------
# BY ENTITY (not strictly needed as Pydantic model,
# but useful if the route ever moves to POST)
# ------------------------------------------------------------
class MediaByEntity(BaseModel):
    entity_type: str
    entity_id: str
