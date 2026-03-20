from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# TABLES
# ============================================================

TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"

TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"
TABLE_CONTENT_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_SOLUTION"

TABLE_NEWS_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_TOPIC"
TABLE_NEWS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_SOLUTION"


# ============================================================
# SEARCH (NEWS + ANALYSES)
# ============================================================

from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


def search(q: str, limit: int = 20) -> List[Dict]:

    sql = f"""
    -- NEWS
    SELECT
        n.ID_NEWS as ID,
        n.TITLE,
        n.EXCERPT,
        'NEWS' as SOURCE_TYPE,
        n.PUBLISHED_AT,

        -- 🔥 BADGE SIMPLE
        [STRUCT(n.NEWS_TYPE as label, 'news_type' as type)] as BADGES

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
        c.PUBLISHED_AT,

        -- 🔥 BADGE SIMPLE (juste type)
        [STRUCT('Analysis' as label, 'analysis' as type)] as BADGES

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

def get_news_curator(id_news: str):

    rows = query_bq(
        f"""
        SELECT
            n.ID_NEWS,
            n.STATUS,
            n.NEWS_KIND,
            n.NEWS_TYPE,
            n.TITLE,
            n.EXCERPT,
            n.BODY,
            n.MEDIA_RECTANGLE_ID,
            n.HAS_VISUAL,
            n.SOURCE_URL,
            n.AUTHOR,
            n.PUBLISHED_AT,
            c.ID_COMPANY,
            c.NAME AS COMPANY_NAME,
            c.IS_PARTNER
        FROM `{TABLE_NEWS}` n
        JOIN `{TABLE_COMPANY}` c
          ON n.ID_COMPANY = c.ID_COMPANY
        WHERE n.ID_NEWS = @id
          AND n.STATUS = 'PUBLISHED'
        LIMIT 1
        """,
        {"id": id_news},
    )

    if not rows:
        return None

    r = rows[0]

    news = {
        "id_news": r["ID_NEWS"],
        "status": r.get("STATUS"),
        "news_kind": r.get("NEWS_KIND"),
        "news_type": r.get("NEWS_TYPE"),

        "title": r.get("TITLE"),
        "excerpt": r.get("EXCERPT"),
        "body": r.get("BODY"),

        "media_rectangle_id": r.get("MEDIA_RECTANGLE_ID"),
        "has_visual": bool(r.get("HAS_VISUAL")),

        "source_url": r.get("SOURCE_URL"),
        "author": r.get("AUTHOR"),

        "published_at": (
            r["PUBLISHED_AT"].isoformat()
            if r.get("PUBLISHED_AT")
            else None
        ),

        "company": {
            "id_company": r.get("ID_COMPANY"),
            "name": r.get("COMPANY_NAME"),
            "is_partner": bool(r.get("IS_PARTNER")),
        },
    }

    # ============================================================
    # TOPICS ✅
    # ============================================================

    topic_rows = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL
        FROM `{TABLE_NEWS_TOPIC}` NT
        JOIN `{TABLE_TOPIC}` T
          ON NT.ID_TOPIC = T.ID_TOPIC
        WHERE NT.ID_NEWS = @id
        """,
        {"id": id_news},
    )

    news["topics"] = [
        {
            "id_topic": t["ID_TOPIC"],
            "label": t["LABEL"],
        }
        for t in topic_rows
    ]

    # ============================================================
    # SOLUTIONS ✅
    # ============================================================

    solution_rows = query_bq(
        f"""
        SELECT S.ID_SOLUTION, S.NAME
        FROM `{TABLE_NEWS_SOLUTION}` NS
        JOIN `{TABLE_SOLUTION}` S
          ON NS.ID_SOLUTION = S.ID_SOLUTION
        WHERE NS.ID_NEWS = @id
        """,
        {"id": id_news},
    )

    news["solutions"] = [
        {
            "id_solution": s["ID_SOLUTION"],
            "name": s["NAME"],
        }
        for s in solution_rows
    ]

    return news
