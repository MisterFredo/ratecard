from typing import List, Optional, Dict


# ============================================================
# CORE OBJECT
# ============================================================

class MonthlyInsight:
    def __init__(
        self,
        id_insight: str,
        entity_type: str,
        entity_id: str,
        year: int,
        month: int,
        key_points: List[str],
        status: str,
        created_at: str,
        updated_at: str,
        title: Optional[str] = None,
    ):
        self.id_insight = id_insight
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.year = year
        self.month = month
        self.title = title
        self.key_points = key_points
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at


# ============================================================
# INPUT (CREATE / UPDATE)
# ============================================================

class MonthlyInsightInput:
    def __init__(
        self,
        entity_type: str,
        entity_id: str,
        year: int,
        month: int,
        key_points: Optional[List[str]] = None,
        title: Optional[str] = None,
        status: Optional[str] = "DRAFT",
    ):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.year = year
        self.month = month
        self.key_points = key_points or []
        self.title = title
        self.status = status


# ============================================================
# GENERATION PAYLOAD (LLM)
# ============================================================

class MonthlyInsightGenerationInput:
    def __init__(
        self,
        entity_type: str,
        entity_id: str,
        year: int,
        month: int,
        force_regenerate: bool = False,
    ):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.year = year
        self.month = month
        self.force_regenerate = force_regenerate


# ============================================================
# OUTPUT (STRUCTURED)
# ============================================================

class MonthlyInsightOutput:
    def __init__(
        self,
        key_points: List[str],
    ):
        self.key_points = key_points
