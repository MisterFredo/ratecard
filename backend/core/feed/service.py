from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


# ============================================================
# FEED UNIFIÉ (NEWS + ANALYSES)
# ============================================================

def list_feed(limit: int = 20, offset: int = 0) -> Dict:

    # ============================================================
    # CONTENT (ANALYSES)
    # ============================================================

    content_rows = query_bq(
        f"""
        SELECT
            ID_CONTENT as id,
            'analysis' as type,
            TITLE,
            EXCERPT,
            SIGNAL_ANALYTIQUE as signal,
            CONCEPT,
            PUBLISHED_AT
        FROM {TABLE_CONTENT}
        WHERE
            STATUS = 'PUBLISHED'
            AND IS_ACTIVE = TRUE
        ORDER BY PUBLISHED_AT DESC
        LIMIT @limit OFFSET @offset
        """,
        {"limit": limit, "offset": offset},
    )

    # ============================================================
    # NEWS
    # ============================================================

    news_rows = query_bq(
        f"""
        SELECT
            n.ID_NEWS as id,
            'news' as type,
            n.TITLE,
            n.EXCERPT,
            NULL as signal,
            NULL as concept,
            n.PUBLISHED_AT,
            c.NAME as company_name
        FROM {TABLE_NEWS} n
        LEFT JOIN {TABLE_COMPANY} c
          ON n.ID_COMPANY = c.ID_COMPANY
        WHERE
            n.STATUS = 'PUBLISHED'
        ORDER BY n.PUBLISHED_AT DESC
        LIMIT @limit OFFSET @offset
        """,
        {"limit": limit, "offset": offset},
    )

    # ============================================================
    # NORMALISATION
    # ============================================================

    items: List[Dict] = []

    for r in content_rows:
        items.append({
            "id": r["id"],
            "type": "analysis",
            "title": r["TITLE"],
            "excerpt": r.get("EXCERPT"),
            "signal": r.get("signal"),
            "concept": r.get("CONCEPT"),
            "published_at": r["PUBLISHED_AT"],
        })

    for r in news_rows:
        items.append({
            "id": r["id"],
            "type": "news",
            "title": r["TITLE"],
            "excerpt": r.get("EXCERPT"),
            "published_at": r["PUBLISHED_AT"],
            "company": r.get("company_name"),
        })

    # ============================================================
    # TRI GLOBAL (clé)
    # ============================================================

    items.sort(
        key=lambda x: x["published_at"] or 0,
        reverse=True
    )

    # ============================================================
    # PAGINATION (V1 SIMPLE)
    # ============================================================

    paginated = items[:limit]

    return {
        "items": paginated,
        "total": len(items),  # V1
    }
