from typing import Optional
from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

TABLE_RADAR = f"{BQ_PROJECT}.{BQ_DATASET}.V_RADAR_ENRICHED"

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"


def get_radar_feed_service(
    limit: int = 50,
    query: Optional[str] = None,
    frequency: Optional[str] = None,
    year: Optional[int] = None,
    period_from: Optional[int] = None,
    period_to: Optional[int] = None,
):

    conditions = []
    params = {"limit": limit}

    # ============================================================
    # SEARCH
    # ============================================================

    if query:
        conditions.append("""
            (
                LOWER(r.ENTITY_LABEL) LIKE LOWER(@query)
                OR LOWER(r.TITLE) LIKE LOWER(@query)
            )
        """)
        params["query"] = f"%{query}%"

    # ============================================================
    # FILTERS
    # ============================================================

    if frequency:
        conditions.append("r.FREQUENCY = @frequency")
        params["frequency"] = frequency

    if year:
        conditions.append("r.YEAR = @year")
        params["year"] = year

    if period_from:
        conditions.append("r.PERIOD >= @period_from")
        params["period_from"] = period_from

    if period_to:
        conditions.append("r.PERIOD <= @period_to")
        params["period_to"] = period_to

    # ============================================================
    # WHERE
    # ============================================================

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # ============================================================
    # QUERY
    # ============================================================

    query_sql = f"""
        SELECT
            r.ID_INSIGHT,
            r.ENTITY_TYPE,
            r.ENTITY_ID,
            r.ENTITY_LABEL,
            r.YEAR,
            r.PERIOD,
            r.FREQUENCY,
            r.TITLE,
            r.KEY_POINTS,
            r.CREATED_AT,

            -- 🔥 VISUAL FIX
            CASE
                WHEN r.ENTITY_TYPE = "company" THEN c.VISUAL_RECT_ID
                WHEN r.ENTITY_TYPE = "solution" THEN s.VISUAL_RECT_ID
                ELSE NULL
            END AS VISUAL_RECT_ID

        FROM `{TABLE_RADAR}` r

        LEFT JOIN `{TABLE_COMPANY}` c
            ON r.ENTITY_TYPE = "company"
            AND r.ENTITY_ID = c.ID_COMPANY

        LEFT JOIN `{TABLE_SOLUTION}` s
            ON r.ENTITY_TYPE = "solution"
            AND r.ENTITY_ID = s.ID_SOLUTION

        {where_clause}

        ORDER BY r.YEAR DESC, r.PERIOD DESC
        LIMIT @limit
    """

    return query_bq(query_sql, params)
