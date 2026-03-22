from typing import Optional, List


# ============================================================
# METRIC OBJECT (CORE)
# ============================================================

class Metric:
    def __init__(
        self,
        label: str,
        value: str,
        range: Optional[str] = None,
        confidence: Optional[str] = None,  # high / medium / low
        sources: Optional[int] = None,
        trend: Optional[str] = None,  # up / down / stable
    ):
        self.label = label
        self.value = value
        self.range = range
        self.confidence = confidence
        self.sources = sources
        self.trend = trend


# ============================================================
# CORE OBJECT
# ============================================================

class NumbersInsight:
    def __init__(
        self,
        id_insight: str,
        entity_type: str,
        entity_id: str,
        year: int,
        period: int,
        frequency: str,
        metrics: List[Metric],
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
        self.metrics = metrics
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at


# ============================================================
# INPUT (CREATE / UPDATE)
# ============================================================

class NumbersInsightInput:
    def __init__(
        self,
        entity_type: str,
        entity_id: str,
        year: int,
        period: int,
        frequency: str,
        metrics: Optional[List[Metric]] = None,
        title: Optional[str] = None,
        status: Optional[str] = "DRAFT",
    ):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.year = year
        self.period = period
        self.frequency = frequency
        self.metrics = metrics or []
        self.title = title
        self.status = status


# ============================================================
# GENERATION INPUT (LLM)
# ============================================================

class NumbersInsightGenerationInput:
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

class NumbersInsightOutput:
    def __init__(
        self,
        metrics: List[Metric],
    ):
        self.metrics = metrics
