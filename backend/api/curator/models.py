from pydantic import BaseModel, field_validator
from typing import List, Optional, Union


# ============================================================
# INPUT — SEARCH TEXT (MODE 1)
# ============================================================

class SearchTextQuery(BaseModel):
    """
    🔍 Mode SEARCH (index BigQuery)
    - uniquement texte
    - aucun filtre
    """

    query: str
    limit: int = 20
    offset: int = 0


# ============================================================
# INPUT — SEARCH FILTERS (MODE 2)
# ============================================================

class SearchFilterQuery(BaseModel):
    """
    🎯 Mode FILTERS
    - aucun texte
    - uniquement filtres SQL
    """

    topic_ids: Optional[Union[List[str], str]] = None
    company_ids: Optional[Union[List[str], str]] = None
    solution_ids: Optional[Union[List[str], str]] = None
    news_types: Optional[Union[List[str], str]] = None

    limit: int = 20
    offset: int = 0

    # 🔥 NORMALISATION AUTO (CRITIQUE)
    @field_validator(
        "topic_ids",
        "company_ids",
        "solution_ids",
        "news_types",
        mode="before"
    )
    @classmethod
    def ensure_list(cls, v):
        if v is None:
            return None

        # cas string vide ou "null"
        if isinstance(v, str):
            if v.strip() == "" or v.lower() == "null":
                return None
            return [v]

        if isinstance(v, list):
            return v if len(v) > 0 else None

        return None


# ============================================================
# OUTPUT — ITEM UNIFIÉ
# ============================================================

class FeedItem(BaseModel):
    id: str
    type: str  # "news" | "analysis"

    title: str
    excerpt: Optional[str] = None
    published_at: Optional[str] = None

    company_id: Optional[str] = None
    company_name: Optional[str] = None

    # spécifique NEWS
    news_type: Optional[str] = None
    has_visual: Optional[bool] = None
    media_id: Optional[str] = None


# ============================================================
# OUTPUT — RESPONSE
# ============================================================

class FeedResponse(BaseModel):
    items: List[FeedItem]
    count: int


# ============================================================
# META (FILTRES)
# ============================================================

class MetaItem(BaseModel):
    id: str
    label: str
    count: int


class FeedMetaResponse(BaseModel):
    topics: List[MetaItem]
    companies: List[MetaItem]
    solutions: List[MetaItem]
    news_types: List[MetaItem]
