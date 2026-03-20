from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.feed.service import search_text, search_filters, get_feed_meta
from core.news.service import get_news
from core.content.public_service import get_content

router = APIRouter()


# ============================================================
# SEARCH — MODE TEXTE (SEARCH INDEX)
# ============================================================

@router.get("/search/text")
def search_text_route(
    query: str = Query(..., description="Search query"),
    limit: int = 20,
    offset: int = 0,
):
    """
    🔥 Mode 1 — SEARCH (comme admin)
    - basé sur index BigQuery
    - rapide, robuste
    - PAS de filtres relationnels
    """

    try:
        results = search_text(
            query=query,
            limit=limit,
            offset=offset,
        )
        return results

    except Exception as e:
        print("❌ SEARCH TEXT ERROR:", e)
        raise HTTPException(400, f"Search text error: {e}")


# ============================================================
# SEARCH — MODE FILTRES (SQL PUR)
# ============================================================

@router.get("/search/filters")
def search_filters_route(
    topic_ids: Optional[List[str]] = Query(None),
    company_ids: Optional[List[str]] = Query(None),
    solution_ids: Optional[List[str]] = Query(None),
    news_types: Optional[List[str]] = Query(None),
    limit: int = 20,
    offset: int = 0,
):
    """
    🔥 Mode 2 — FILTERS
    - aucun SEARCH
    - uniquement filtres SQL (topic, company, etc.)
    - robuste et déterministe
    """

    try:
        results = search_filters(
            topic_ids=topic_ids,
            company_ids=company_ids,
            solution_ids=solution_ids,
            news_types=news_types,
            limit=limit,
            offset=offset,
        )
        return results

    except Exception as e:
        print("❌ SEARCH FILTER ERROR:", e)
        raise HTTPException(400, f"Search filter error: {e}")


# ============================================================
# META (FILTRES)
# ============================================================

@router.get("/meta")
def get_meta_route():
    try:
        data = get_feed_meta()

        if not isinstance(data, dict):
            print("⚠️ get_feed_meta returned non-dict:", type(data))
            data = {}

        return {
            "topics": data.get("topics", []) or [],
            "companies": data.get("companies", []) or [],
            "solutions": data.get("solutions", []) or [],
            "news_types": data.get("news_types", []) or [],
        }

    except Exception as e:
        print("❌ META ERROR:", e)
        return {
            "topics": [],
            "companies": [],
            "solutions": [],
            "news_types": [],
        }


# ============================================================
# DRAWER NEWS
# ============================================================

@router.get("/news/{id_news}")
def read_news(id_news: str):
    try:
        item = get_news(id_news)

        if not item:
            raise HTTPException(404, "News not found")

        return item

    except HTTPException:
        raise
    except Exception as e:
        print("❌ NEWS ERROR:", e)
        raise HTTPException(400, f"News error: {e}")


# ============================================================
# DRAWER CONTENT
# ============================================================

@router.get("/content/{id_content}")
def read_content(id_content: str):
    try:
        item = get_content(id_content)

        if not item:
            raise HTTPException(404, "Content not found")

        return item

    except HTTPException:
        raise
    except Exception as e:
        print("❌ CONTENT ERROR:", e)
        raise HTTPException(400, f"Content error: {e}")
