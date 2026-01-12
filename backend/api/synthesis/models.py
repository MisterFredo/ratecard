# backend/api/synthesis/models.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import date


# ============================================================
# CREATE SYNTHESIS (META)
# ============================================================
class SynthesisCreate(BaseModel):
    id_model: str
    synthesis_type: str  # CHIFFRES | ANALYTIQUE | CARTOGRAPHIE
    date_from: date
    date_to: date


# ============================================================
# ATTACH CONTENTS
# ============================================================
class SynthesisAttachContents(BaseModel):
    content_ids: List[str]  # max 5 (contrôle front + back léger)


# ============================================================
# LIST CANDIDATE CONTENTS
# ============================================================
class SynthesisCandidatesQuery(BaseModel):
    topic_ids: Optional[List[str]] = []
    company_ids: Optional[List[str]] = []
    date_from: date
    date_to: date
