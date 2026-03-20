from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# TABLES
# ============================================================

TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


# ============================================================
# SEARCH (NEWS + ANALYSES)
# ============================================================

def search(q: str, limit: int = 20) -> List[Dict]:
    """
    Recherche full-text sur NEWS + ANALYSES
    via BigQuery Search Index.

    ⚠️ Repose sur des SEARCH INDEX créés sur :
    - RATECARD_NEWS
    - RATECARD_CONTENT
    """

    sql = f"""
    -- NEWS
    SELECT
        n.ID_NEWS as ID,
        n.TITLE,
        n.EXCERPT,
        'NEWS' as SOURCE_TYPE,
        n.PUBLISHED_AT
    FROM `{TABLE_NEWS}` n
    WHERE n.STATUS = 'PUBLISHED'
      AND SEARCH(n, @query)

    UNION ALL

    -- ANALYSES
    SELECT
        c.ID_CONTENT as ID,
        c.TITLE,
        c.EXCERPT,
        'ANALYSIS' as SOURCE_TYPE,
        c.PUBLISHED_AT
    FROM `{TABLE_CONTENT}` c
    WHERE c.STATUS = 'PUBLISHED'
      AND SEARCH(c, @query)

    ORDER BY PUBLISHED_AT DESC
    LIMIT @limit
    """

    return query_bq(
        sql,
        {
            "query": q,
            "limit": limit,
        }
    )

def get_content_curator(id_content: str):

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          TITLE,
          EXCERPT,
          CONTENT_BODY,
          MECANIQUE_EXPLIQUEE,
          ENJEU_STRATEGIQUE,
          POINT_DE_FRICTION,
          SIGNAL_ANALYTIQUE,
          PUBLISHED_AT
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT = @id
          AND STATUS = 'PUBLISHED'
        LIMIT 1
        """,
        {"id": id_content},
    )

    if not rows:
        return None

    row = rows[0]

    def map_dt(value):
        return value.isoformat() if value else None

    content = {
        "id_content": row["ID_CONTENT"],
        "title": row.get("TITLE"),
        "excerpt": row.get("EXCERPT"),
        "content_body": row.get("CONTENT_BODY"),

        "mecanique_expliquee": row.get("MECANIQUE_EXPLIQUEE"),
        "enjeu_strategique": row.get("ENJEU_STRATEGIQUE"),
        "point_de_friction": row.get("POINT_DE_FRICTION"),
        "signal_analytique": row.get("SIGNAL_ANALYTIQUE"),

        "published_at": map_dt(row.get("PUBLISHED_AT")),
    }

    # ============================================================
    # TOPICS ✅
    # ============================================================

    topic_rows = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL
        FROM `{TABLE_CONTENT_TOPIC}` CT
        JOIN `{TABLE_TOPIC}` T
          ON CT.ID_TOPIC = T.ID_TOPIC
        WHERE CT.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["topics"] = [
        {
            "id_topic": r["ID_TOPIC"],
            "label": r["LABEL"],
        }
        for r in topic_rows
    ]

    # ============================================================
    # COMPANIES ✅
    # ============================================================

    company_rows = query_bq(
        f"""
        SELECT C.ID_COMPANY, C.NAME
        FROM `{TABLE_CONTENT_COMPANY}` CC
        JOIN `{TABLE_COMPANY}` C
          ON CC.ID_COMPANY = C.ID_COMPANY
        WHERE CC.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["companies"] = [
        {
            "id_company": r["ID_COMPANY"],
            "name": r["NAME"],
        }
        for r in company_rows
    ]

    # ============================================================
    # SOLUTIONS ✅
    # ============================================================

    solution_rows = query_bq(
        f"""
        SELECT S.ID_SOLUTION, S.NAME
        FROM `{TABLE_CONTENT_SOLUTION}` CS
        JOIN `{TABLE_SOLUTION}` S
          ON CS.ID_SOLUTION = S.ID_SOLUTION
        WHERE CS.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["solutions"] = [
        {
            "id_solution": r["ID_SOLUTION"],
            "name": r["NAME"],
        }
        for r in solution_rows
    ]

    return content
