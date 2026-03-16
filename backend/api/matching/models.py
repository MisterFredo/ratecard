from pydantic import BaseModel
from typing import Optional


# ===============================================
# LLM SOLUTION
# ===============================================

class LLMSolution(BaseModel):
    value: str
    count: int


# ===============================================
# LLM COMPANY
# ===============================================

class LLMCompany(BaseModel):
    value: str
    count: int


# ===============================================
# MATCH SOLUTION
# ===============================================

class SolutionMatch(BaseModel):

    alias: str
    id_solution: Optional[str] = None
    action: str  # MATCH | IGNORE | CREATE


# ===============================================
# MATCH COMPANY
# ===============================================

class CompanyMatch(BaseModel):

    alias: str
    id_company: Optional[str] = None
    action: str  # MATCH | IGNORE | CREATE
