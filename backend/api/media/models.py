# backend/api/media/models.py

from pydantic import BaseModel
from typing import Optional


# ------------------------------------------------------------
# REGISTER MEDIA (payload JSON envoyé par Next.js)
# ------------------------------------------------------------
class MediaRegister(BaseModel):
    filepath: str           # ex: "/uploads/media/logos/myfile_square.jpg"
    format: str             # "square" | "rectangle" | "original"
    title: str              # 🆕 Titre éditorial fourni par l’utilisateur


# ------------------------------------------------------------
# ASSIGN MEDIA TO ENTITY
# ------------------------------------------------------------
class MediaAssign(BaseModel):
    media_id: str
    entity_type: str        # "company" | "person" | "axe" | "article"
    entity_id: str


# ------------------------------------------------------------
# UNASSIGN MEDIA
# ------------------------------------------------------------
class MediaUnassign(BaseModel):
    media_id: str


# ------------------------------------------------------------
# BY ENTITY (utile si un jour la route passe en POST)
# ------------------------------------------------------------
class MediaByEntity(BaseModel):
    entity_type: str
    entity_id: str


# ------------------------------------------------------------
# UPDATE TITLE
# ------------------------------------------------------------
class MediaUpdateTitle(BaseModel):
    media_id: str
    title: str


