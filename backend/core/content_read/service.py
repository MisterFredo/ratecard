from typing import Optional, List, Dict
from datetime import date, timedelta

from utils.bigquery_utils import query_bq

# ============================================================
# TABLES
# ============================================================
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"
TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_SYNTHESIS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS"
TABLE_SYNTHESIS_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS_CONTENT"



# ============================================================
# HELPERS
# ============================================================

def _build_scope(topic_id: Optional[str], company_id: Optional[str]) -> Dict:
    return {
        "topic_id": topic_id,
        "company_id": company_id
    }


def _build_period(date_from: date, date_to: date) -> Dict:
    return {
        "from": date_from.isoformat(),
        "to": date_to.isoformat()
    }


def _scope_join_and_where(topic_id: Optional[str], company_id: Optional[str]):
    """
    Returns SQL JOIN + WHERE parts depending on scope.
    """
    if topic_id:
        join = f"""
            JOIN {TABLE_CONTENT_TOPIC} ct
              ON c.ID_CONTENT = ct.ID_CONTENT
        """
        where = "ct.ID_TOPIC = @scope_id"
    else:
        join = f"""
            JOIN {TABLE_CONTENT_COMPANY} cc
              ON c.ID_CONTENT = cc.ID_CONTENT
        """
        where = "cc.ID_COMPANY = @scope_id"

    return join, where


# ============================================================
# /content/list
# ============================================================

def list_content_read(
    topic_id: Optional[str],
    company_id: Optional[str],
    date_from: date,
    date_to: date,
    limit: int,
    offset: int,
):
    join, where = _scope_join_and_where(topic_id, company_id)

    sql = f"""
        SELECT
            c.ID_CONTENT,
            c.ANGLE_TITLE,
            c.ANGLE_SIGNAL,
            c.EXCERPT,
            c.PUBLISHED_AT
        FROM {TABLE_CONTENT} c
        {join}
        WHERE
            {where}
            AND c.STATUS = 'PUBLISHED'
            AND c.IS_ACTIVE = TRUE
            AND c.PUBLISHED_AT BETWEEN @date_from AND @date_to
        ORDER BY c.PUBLISHED_AT DESC
        LIMIT @limit OFFSET @offset
    """

    rows = query_bq(sql, {
        "scope_id": topic_id or company_id,
        "date_from": date_from,
        "date_to": date_to,
        "limit": limit,
        "offset": offset,
    })

    items = []
    for r in rows:
        items.append({
            "id_content": r["ID_CONTENT"],
            "angle_title": r["ANGLE_TITLE"],
            "angle_signal": r["ANGLE_SIGNAL"],
            "excerpt": r["EXCERPT"],
            "published_at": r["PUBLISHED_AT"],
            "topics": [],
            "companies": [],
        })

    return {
        "meta": {
            "scope": _build_scope(topic_id, company_id),
            "period": _build_period(date_from, date_to),
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": len(items)  # ⚠️ simplification Phase 1
            }
        },
        "items": items
    }


# ============================================================
# /content/overview
# ============================================================

def overview_content_read(
    topic_id: Optional[str],
    company_id: Optional[str],
    date_from: date,
    date_to: date,
):
    join, where = _scope_join_and_where(topic_id, company_id)

    sql = f"""
        SELECT
            COUNT(*) AS total,
            COUNTIF(c.PUBLISHED_AT >= DATE_SUB(@date_to, INTERVAL 30 DAY)) AS last_30,
            COUNTIF(c.PUBLISHED_AT >= DATE_SUB(@date_to, INTERVAL 90 DAY)) AS last_90
        FROM {TABLE_CONTENT} c
        {join}
        WHERE
            {where}
            AND c.STATUS = 'PUBLISHED'
            AND c.IS_ACTIVE = TRUE
            AND c.PUBLISHED_AT BETWEEN @date_from AND @date_to
    """

    row = query_bq(sql, {
        "scope_id": topic_id or company_id,
        "date_from": date_from,
        "date_to": date_to,
    })[0]

    return {
        "scope": _build_scope(topic_id, company_id),
        "period": _build_period(date_from, date_to),
        "total_analyses": row["total"],
        "last_30_days": row["last_30"],
        "last_90_days": row["last_90"],
        "delta_vs_previous_period": 0  # ⚠️ calcul ultérieur
    }


# ============================================================
# /content/timeline
# ============================================================

def timeline_content_read(
    topic_id: Optional[str],
    company_id: Optional[str],
    date_from: date,
    date_to: date,
):
    join, where = _scope_join_and_where(topic_id, company_id)

    sql = f"""
        SELECT
            FORMAT_DATE('%Y-%m', c.PUBLISHED_AT) AS period,
            COUNT(*) AS count
        FROM {TABLE_CONTENT} c
        {join}
        WHERE
            {where}
            AND c.STATUS = 'PUBLISHED'
            AND c.IS_ACTIVE = TRUE
            AND c.PUBLISHED_AT BETWEEN @date_from AND @date_to
        GROUP BY period
        ORDER BY period ASC
    """

    rows = query_bq(sql, {
        "scope_id": topic_id or company_id,
        "date_from": date_from,
        "date_to": date_to,
    })

    timeline = [{"period": r["period"], "count": r["count"]} for r in rows]

    return {
        "scope": _build_scope(topic_id, company_id),
        "period": _build_period(date_from, date_to),
        "timeline": timeline
    }


# ============================================================
# /content/signals (STUB)
# ============================================================

def signals_stub_content_read(
    topic_id: Optional[str],
    company_id: Optional[str],
    date_from: date,
    date_to: date,
):
    """
    Stub for Pinecone-based signals.
    """
    return {
        "scope": _build_scope(topic_id, company_id),
        "period": _build_period(date_from, date_to),
        "signals": []
    }


# ============================================================
# /content/treatments
# ============================================================

def treatments_content_read(
    topic_id: Optional[str],
    company_id: Optional[str],
):
    """
    Existing syntheses for this scope.
    """
    # Phase 1: simple listing without joins
    sql = f"""
        SELECT
            s.ID_SYNTHESIS,
            s.TYPE,
            s.TITLE,
            s.DATE_FROM,
            s.DATE_TO,
            s.CREATED_AT
        FROM {TABLE_SYNTHESIS} s
        WHERE
            s.STATUS = 'READY'
        ORDER BY s.CREATED_AT DESC
        LIMIT 20
    """

    rows = query_bq(sql)

    treatments = []
    for r in rows:
        treatments.append({
            "id": r["ID_SYNTHESIS"],
            "type": r["TYPE"],
            "title": r["TITLE"],
            "date_from": r["DATE_FROM"],
            "date_to": r["DATE_TO"],
            "created_at": r["CREATED_AT"].date(),
        })

    return {
        "scope": _build_scope(topic_id, company_id),
        "treatments": treatments
    }
