from typing import List, Dict, Optional
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


# ============================================================
# LIST CONTENTS (CURATOR FEED)
# ============================================================

def list_contents(
    limit: int = 20,
    offset: int = 0,
    topic_id: Optional[str] = None,
):
    """
    Retourne les contenus publiés (feed Curator).
    """

    filters = [
        "STATUS = 'PUBLISHED'",
        "IS_ACTIVE = TRUE"
    ]

    params = {
        "limit": limit,
        "offset": offset,
    }

    if topic_id:
        filters.append("ARRAY_CONTAINS(TOPICS, @topic_id)")
        params["topic_id"] = topic_id

    where_clause = " AND ".join(filters)

    sql = f"""
        SELECT
            ID_CONTENT,
            TITLE,
            EXCERPT,
            SIGNAL,
            CONCEPT,
            PUBLISHED_AT,
            TOPICS,
            KEY_METRICS
        FROM `{TABLE_CONTENT}`
        WHERE {where_clause}
        ORDER BY PUBLISHED_AT DESC
        LIMIT @limit OFFSET @offset
    """

    rows = query_bq(sql, params)

    items = []
    for r in rows:
        items.append({
            "id": r["ID_CONTENT"],
            "title": r["TITLE"],
            "excerpt": r.get("EXCERPT"),
            "signal": r.get("SIGNAL"),
            "concept": r.get("CONCEPT"),
            "published_at": r["PUBLISHED_AT"],
            "topics": r.get("TOPICS") or [],
            "key_metrics": r.get("KEY_METRICS") or [],
        })

    return items


# ============================================================
# READ CONTENT (DRAWER CURATOR)
# ============================================================

def get_content(id_content: str) -> Dict:
    """
    Retourne un contenu détaillé (drawer Curator).
    """

    sql = f"""
        SELECT
            ID_CONTENT,
            TITLE,
            SIGNAL,
            EXCERPT,
            CONCEPT,
            CONTENT_BODY,
            CHIFFRES,
            CITATIONS,
            ACTEURS_CITES,
            PUBLISHED_AT,
            TOPICS,
            KEY_METRICS
        FROM `{TABLE_CONTENT}`
        WHERE
            ID_CONTENT = @id_content
            AND STATUS = 'PUBLISHED'
            AND IS_ACTIVE = TRUE
        LIMIT 1
    """

    rows = query_bq(sql, {"id_content": id_content})

    if not rows:
        return None

    r = rows[0]

    return {
        "id_content": r["ID_CONTENT"],
        "title": r["TITLE"],
        "signal": r.get("SIGNAL"),
        "excerpt": r.get("EXCERPT"),
        "concept": r.get("CONCEPT"),
        "content_body": r.get("CONTENT_BODY"),
        "chiffres": r.get("CHIFFRES") or [],
        "citations": r.get("CITATIONS") or [],
        "acteurs_cites": r.get("ACTEURS_CITES") or [],
        "published_at": r["PUBLISHED_AT"],
        "topics": r.get("TOPICS") or [],
        "key_metrics": r.get("KEY_METRICS") or [],
    }
