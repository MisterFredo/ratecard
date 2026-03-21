from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

# 🔗 DATA LAYER (CRUD pur)
from core.company.service import get_company


# ============================================================
# VIEWS (alignées avec search)
# ============================================================

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"


# ============================================================
# INTERNAL — FEED BUILDER (GENERIC)
# ============================================================

def _get_entity_feed(
    where_clause_news: str,
    where_clause_content: str,
    params: Dict,
    limit: int = 50
) -> List[Dict]:

    sql = f"""
    -- NEWS
    SELECT
        n.id_news AS id,
        'news' AS type,
        n.title,
        n.excerpt,
        n.published_at,
        n.news_type,
        n.topics,
        ARRAY<STRUCT<id_company STRING, name STRING>>[
          STRUCT(n.id_company, n.company_name)
        ] AS companies,
        [] AS solutions

    FROM `{VIEW_NEWS}` n
    WHERE {where_clause_news}

    UNION ALL

    -- CONTENT
    SELECT
        c.id_content AS id,
        'analysis' AS type,
        c.title,
        c.excerpt,
        c.published_at,
        NULL AS news_type,
        c.topics,
        c.companies,
        c.solutions

    FROM `{VIEW_CONTENT}` c
    WHERE {where_clause_content}

    ORDER BY published_at DESC
    LIMIT @limit
    """

    query_params = {**params, "limit": limit}

    rows = query_bq(sql, query_params)

    return [_map_feed_row(r) for r in rows]


# ============================================================
# COMPANY
# ============================================================

def get_company_feed(company_id: str, limit: int = 50) -> List[Dict]:

    return _get_entity_feed(
        where_clause_news="n.id_company = @company_id",
        where_clause_content="""
            EXISTS (
                SELECT 1
                FROM UNNEST(c.companies) comp
                WHERE comp.id_company = @company_id
            )
        """,
        params={"company_id": company_id},
        limit=limit
    )


def get_company_view(company_id: str) -> Optional[Dict]:

    company = get_company(company_id)

    if not company:
        return None

    items = get_company_feed(company_id)

    return {
        **company,
        "items": items
    }


# ============================================================
# TOPIC
# ============================================================

def get_topic_feed(topic_id: str, limit: int = 50) -> List[Dict]:

    return _get_entity_feed(
        where_clause_news="""
            EXISTS (
                SELECT 1
                FROM UNNEST(n.topics) t
                WHERE t.id_topic = @topic_id
            )
        """,
        where_clause_content="""
            EXISTS (
                SELECT 1
                FROM UNNEST(c.topics) t
                WHERE t.id_topic = @topic_id
            )
        """,
        params={"topic_id": topic_id},
        limit=limit
    )


def get_topic_view(topic_id: str) -> Dict:

    items = get_topic_feed(topic_id)

    return {
        "id_topic": topic_id,
        "items": items
    }


# ============================================================
# SOLUTION
# ============================================================

def get_solution_feed(solution_id: str, limit: int = 50) -> List[Dict]:

    return _get_entity_feed(
        where_clause_news="FALSE",  # pas de lien direct côté news
        where_clause_content="""
            EXISTS (
                SELECT 1
                FROM UNNEST(c.solutions) s
                WHERE s.id_solution = @solution_id
            )
        """,
        params={"solution_id": solution_id},
        limit=limit
    )


def get_solution_view(solution_id: str) -> Dict:

    items = get_solution_feed(solution_id)

    return {
        "id_solution": solution_id,
        "items": items
    }


# ============================================================
# MAPPER (strictement aligné avec search)
# ============================================================

def _map_feed_row(r: Dict) -> Dict:

    def map_dt(value):
        return value.isoformat() if value else None

    return {
        "id": r.get("id"),
        "type": r.get("type"),
        "title": r.get("title"),
        "excerpt": r.get("excerpt"),
        "published_at": map_dt(r.get("published_at")),
        "news_type": r.get("news_type"),
        "topics": r.get("topics") or [],
        "companies": r.get("companies") or [],
        "solutions": r.get("solutions") or [],
    }
