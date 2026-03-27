from typing import Optional, List


# ============================================================
# CORE OBJECT
# ============================================================

class RadarInsight:
    def __init__(
        self,
        id_insight: str,
        entity_type: str,
        entity_id: str,
        year: int,
        period: int,
        frequency: str,  # WEEKLY / MONTHLY / QUARTERLY
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
        self.period = period
        self.frequency = frequency
        self.title = title
        self.key_points = key_points
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at


# ============================================================
# INPUT (CREATE / UPDATE)
# ============================================================

class RadarInsightInput:
    def __init__(
        self,
        entity_type: str,
        entity_id: str,
        year: int,
        period: int,
        frequency: str,
        key_points: Optional[List[str]] = None,
        title: Optional[str] = None,
        status: Optional[str] = "DRAFT",
    ):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.year = year
        self.period = period
        self.frequency = frequency
        self.key_points = key_points or []
        self.title = title
        self.status = status


# ============================================================
# GENERATION INPUT (LLM)
# ============================================================

class RadarInsightGenerationInput:
    def __init__(
        self,
        entity_type: str,
        entity_id: str,
        year: int,
        period: int,
        frequency: str,
        force: bool = False,
    ):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.year = year
        self.period = period
        self.frequency = frequency
        self.force = force


# ============================================================
# OUTPUT (STRUCTURÉ LLM)
# ============================================================

class RadarInsightOutput:
    def __init__(
        self,
        key_points: List[str],
    ):
        self.key_points = key_points

# ============================================================
# PAGE FRONT CURATOR
# ============================================================

class RadarFeedItem(BaseModel):
    id_insight: str

    entity_type: str
    entity_id: str

    year: int
    period: int
    frequency: str

    title: Optional[str] = None
    key_points: List[str] = []

    category: Optional[str] = None  # pour le group by front

    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class RadarInsightRequest(BaseModel):
    ids: List[str]

class RadarInsightResponse(BaseModel):
    insight: str
