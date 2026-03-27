from typing import Optional
from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

TABLE_RADAR = f"{BQ_PROJECT}.{BQ_DATASET}.V_RADAR_ENRICHED"

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"


def get_radar_feed_service(
    limit: int = 120,
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
                LOWER(ENTITY_LABEL) LIKE LOWER(@query)
                OR LOWER(TITLE) LIKE LOWER(@query)
            )
        """)
        params["query"] = f"%{query}%"

    # ============================================================
    # FILTERS
    # ============================================================

    if frequency:
        conditions.append("FREQUENCY = @frequency")
        params["frequency"] = frequency

    if year:
        conditions.append("YEAR = @year")
        params["year"] = year

    if period_from:
        conditions.append("PERIOD >= @period_from")
        params["period_from"] = period_from

    if period_to:
        conditions.append("PERIOD <= @period_to")
        params["period_to"] = period_to

    # ============================================================
    # WHERE SAFE
    # ============================================================

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # ============================================================
    # QUERY
    # ============================================================

    query_sql = f"""
        SELECT
            ID_INSIGHT,
            ENTITY_TYPE,
            ENTITY_ID,
            ENTITY_LABEL,
            VISUAL_RECT_ID,
            YEAR,
            PERIOD,
            FREQUENCY,
            TITLE,
            KEY_POINTS,
            CREATED_AT
        FROM `{TABLE_RADAR}`
        {where_clause}
        ORDER BY YEAR DESC, PERIOD DESC
        LIMIT @limit
    """

    return query_bq(query_sql, params)

