from pydantic import BaseModel
from typing import Optional


# ===============================================
# LLM ENTITY
# ===============================================

class LLMSolution(BaseModel):
    value: str
    count: int


# ===============================================
# MATCH ACTION
# ===============================================

class SolutionMatch(BaseModel):

    alias: str
    id_solution: Optional[str] = None
    action: str  # MATCH | IGNORE | CREATE
