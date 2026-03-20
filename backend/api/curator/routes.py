from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.feed.service import search_curator, get_feed_meta
from core.news.service import get_news
from core.content.public_service import get_content

router = APIRouter()


# ============================================================
# SEARCH (MOTEUR UNIQUE)
# ============================================================

@router.get("/search")
def search_route(
    query: Optional[str] = None,

    topic_ids: Optional[List[str]] = Query(default=None),
    company_ids: Optional[List[str]] = Query(default=None),
    solution_ids: Optional[List[str]] = Query(default=None),
    news_types: Optional[List[str]] = Query(default=None),

    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    try:
        items = search_curator(
            query=query,
            topic_ids=topic_ids,
            company_ids=company_ids,
            solution_ids=solution_ids,
            news_types=news_types,
            limit=limit,
            offset=offset,
        )

        # 🔒 SAFE GUARD (CRITIQUE)
        if not isinstance(items, list):
            print("⚠️ search_curator returned non-list:", type(items))
            items = []

        return {
            "items": items,
            "count": len(items),
        }

    except Exception as e:
        print("❌ SEARCH ERROR:", e)
        return {
            "items": [],
            "count": 0,
        }


# ============================================================
# META
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
