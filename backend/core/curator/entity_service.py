from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

# 🔗 DATA LAYER
from core.company.service import get_company

# ============================================================
# VIEWS
# ============================================================

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"

VIEW_STATS_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_COMPANY"
VIEW_STATS_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_TOPIC"
VIEW_STATS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_SOLUTION"

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"


# ============================================================
# INTERNAL — FEED BUILDER
# ============================================================

def _get_entity_feed(
    where_clause_news: str,
    where_clause_content: str,
    params: Dict,
    limit: int = 50,
    offset: int = 0
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
    OFFSET @offset
    """

    query_params = {
        **params,
        "limit": limit,
        "offset": offset,
    }

    rows = query_bq(sql, query_params)

    return [_map_feed_row(r) for r in rows]


# ============================================================
# COMPANY
# ============================================================

def get_company_feed(
    company_id: str,
    limit: int = 50,
    offset: int = 0
) -> List[Dict]:

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
        limit=limit,
        offset=offset
    )


def get_company_view(
    company_id: str,
    limit: int = 50,
    offset: int = 0
) -> Optional[Dict]:

    company = get_company(company_id)

    if not company:
        return None

    # STATS
    stats_rows = query_bq(f"""
        SELECT
            COALESCE(total, 0) AS NB_ANALYSES,
            COALESCE(last_30_days, 0) AS DELTA_30D
        FROM `{VIEW_STATS_COMPANY}`
        WHERE id_company = @company_id
        LIMIT 1
    """, {"company_id": company_id})

    stats = stats_rows[0] if stats_rows else {}

    items = get_company_feed(company_id, limit, offset)

    return {
        **company,
        "nb_analyses": stats.get("NB_ANALYSES", 0),
        "delta_30d": stats.get("DELTA_30D", 0),
        "items": items
    }


# ============================================================
# TOPIC
# ============================================================

def get_topic_feed(
    topic_id: str,
    limit: int = 50,
    offset: int = 0
) -> List[Dict]:

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
        limit=limit,
        offset=offset
    )


def get_topic_view(
    topic_id: str,
    limit: int = 50,
    offset: int = 0
) -> Dict:

    # ============================================================
    # 🔥 TOPIC INFO (LABEL + AXIS)
    # ============================================================

    topic_rows = query_bq(f"""
        SELECT
            ID_TOPIC,
            LABEL,
            TOPIC_AXIS
        FROM `{TABLE_TOPIC}`
        WHERE ID_TOPIC = @topic_id
        LIMIT 1
    """, {"topic_id": topic_id})

    topic = topic_rows[0] if topic_rows else {}

    # ============================================================
    # STATS
    # ============================================================

    stats_rows = query_bq(f"""
        SELECT
            COALESCE(total, 0) AS NB_ANALYSES,
            COALESCE(last_30_days, 0) AS DELTA_30D
        FROM `{VIEW_STATS_TOPIC}`
        WHERE id_topic = @topic_id
        LIMIT 1
    """, {"topic_id": topic_id})

    stats = stats_rows[0] if stats_rows else {}

    # ============================================================
    # FEED
    # ============================================================

    items = get_topic_feed(topic_id, limit, offset)

    # ============================================================
    # RETURN
    # ============================================================

    return {
        "id_topic": topic_id,
        "label": topic.get("LABEL"),          # 🔥 FIX
        "topic_axis": topic.get("TOPIC_AXIS"),# 🔥 FIX
        "nb_analyses": stats.get("NB_ANALYSES", 0),
        "delta_30d": stats.get("DELTA_30D", 0),
        "items": items
    }

# ============================================================
# SOLUTION
# ============================================================

def get_solution_feed(
    solution_id: str,
    limit: int = 50,
    offset: int = 0
) -> List[Dict]:

    return _get_entity_feed(
        where_clause_news="FALSE",
        where_clause_content="""
            EXISTS (
                SELECT 1
                FROM UNNEST(c.solutions) s
                WHERE s.id_solution = @solution_id
            )
        """,
        params={"solution_id": solution_id},
        limit=limit,
        offset=offset
    )


def get_solution_view(
    solution_id: str,
    limit: int = 50,
    offset: int = 0
) -> Dict:

    # ============================================================
    # 🔥 SOLUTION INFO (NAME + COMPANY + LOGO)
    # ============================================================

    solution_rows = query_bq(f"""
        SELECT
            s.ID_SOLUTION,
            s.NAME,
            c.NAME AS COMPANY_NAME,
            c.MEDIA_LOGO_RECTANGLE_ID
        FROM `{TABLE_SOLUTION}` s
        LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY` c
            ON c.ID_COMPANY = s.ID_COMPANY
        WHERE s.ID_SOLUTION = @solution_id
        LIMIT 1
    """, {"solution_id": solution_id})

    solution = solution_rows[0] if solution_rows else {}

    # ============================================================
    # STATS
    # ============================================================

    stats_rows = query_bq(f"""
        SELECT
            COALESCE(total, 0) AS NB_ANALYSES,
            COALESCE(last_30_days, 0) AS DELTA_30D
        FROM `{VIEW_STATS_SOLUTION}`
        WHERE id_solution = @solution_id
        LIMIT 1
    """, {"solution_id": solution_id})

    stats = stats_rows[0] if stats_rows else {}

    # ============================================================
    # FEED
    # ============================================================

    items = get_solution_feed(solution_id, limit, offset)

    # ============================================================
    # RETURN
    # ============================================================

    return {
        "id_solution": solution_id,
        "name": solution.get("NAME"),                         # 🔥 FIX
        "company_name": solution.get("COMPANY_NAME"),         # 🔥 FIX
        "media_logo_rectangle_id": solution.get("MEDIA_LOGO_RECTANGLE_ID"),  # 🔥 FIX
        "nb_analyses": stats.get("NB_ANALYSES", 0),
        "delta_30d": stats.get("DELTA_30D", 0),
        "items": items
    }

# ============================================================
# MAPPER
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
