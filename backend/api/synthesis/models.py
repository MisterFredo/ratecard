from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# CREATE SYNTHESIS (META)
# ============================================================
class SynthesisCreate(BaseModel):
    id_model: str
    synthesis_type: str  # CHIFFRES | ANALYTIQUE | CARTOGRAPHIE
    date_from: str       # "YYYY-MM-DD"
    date_to: str         # "YYYY-MM-DD"


# ============================================================
# ATTACH CONTENTS
# ============================================================
class SynthesisAttachContents(BaseModel):
    content_ids: List[str]  # max 5


# ============================================================
# LIST CANDIDATE CONTENTS
# ============================================================
class SynthesisCandidatesQuery(BaseModel):
    topic_ids: Optional[List[str]] = []
    company_ids: Optional[List[str]] = []
    date_from: str         # "YYYY-MM-DD"
    date_to: str           # "YYYY-MM-DD"


# ============================================================
# CREATE MODEL
# ============================================================
class SynthesisModelCreate(BaseModel):
    name: str
    topic_ids: Optional[List[str]] = []
    company_ids: Optional[List[str]] = []


# ============================================================
# UPDATE MODEL
# ============================================================
class SynthesisModelUpdate(BaseModel):
    name: Optional[str] = None
    topic_ids: Optional[List[str]] = None
    company_ids: Optional[List[str]] = None

