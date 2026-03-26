from typing import Optional, List


# ============================================================
# NUMBER (CORE OBJECT)
# ============================================================

class Number:
    def __init__(
        self,
        id_number: str,
        value: float,
        unit: str,
        id_number_type: str,
        zone: str,
        period: str,
        source_id: str,
        type_news: str,
        created_at: str,
    ):
        self.id_number = id_number
        self.value = value
        self.unit = unit
        self.id_number_type = id_number_type
        self.zone = zone
        self.period = period
        self.source_id = source_id
        self.type_news = type_news
        self.created_at = created_at


# ============================================================
# INPUT (CREATE MANUEL / GUIDÉ)
# ============================================================

class NumberInput:
    def __init__(
        self,
        value: float,
        unit: str,
        id_number_type: str,
        zone: str,
        period: str,
        source_id: str,
        type_news: str,

        company_ids: Optional[List[str]] = None,
        topic_ids: Optional[List[str]] = None,
        solution_ids: Optional[List[str]] = None,
    ):
        self.value = value
        self.unit = unit
        self.id_number_type = id_number_type
        self.zone = zone
        self.period = period
        self.source_id = source_id
        self.type_news = type_news

        self.company_ids = company_ids or []
        self.topic_ids = topic_ids or []
        self.solution_ids = solution_ids or []


# ============================================================
# OUTPUT (CREATE RESPONSE)
# ============================================================

class NumberCreateResponse:
    def __init__(
        self,
        id_number: str,
        quality_status: str,
        quality_reason: Optional[str] = None,
    ):
        self.id_number = id_number
        self.quality_status = quality_status  # ok / duplicate / warning / invalid
        self.quality_reason = quality_reason


# ============================================================
# PARSED NUMBER (FROM CONTENT)
# ============================================================

class ParsedNumber:
    def __init__(
        self,
        label: str,
        value: float,
        unit: str,
        actor: str,
        zone: str,
        period: str,
    ):
        self.label = label
        self.value = value
        self.unit = unit
        self.actor = actor  # UI only
        self.zone = zone
        self.period = period


# ============================================================
# LIST RESPONSE
# ============================================================

class NumberListItem:
    def __init__(
        self,
        id_number: str,
        value: float,
        unit: str,
        id_number_type: str,
        zone: str,
        period: str,
        type_news: str,
        created_at: str,
    ):
        self.id_number = id_number
        self.value = value
        self.unit = unit
        self.id_number_type = id_number_type
        self.zone = zone
        self.period = period
        self.type_news = type_news
        self.created_at = created_at
