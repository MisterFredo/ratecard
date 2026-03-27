from typing import Optional
from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

TABLE_RADAR = f"{BQ_PROJECT}.{BQ_DATASET}.V_RADAR_ENRICHED"


def get_radar_feed_service(limit: int = 50, query: Optional[str] = None):

    base_query = f"""
        SELECT *
        FROM `{TABLE_RADAR}`
    """

    if query:
        base_query += """
        WHERE LOWER(TITLE) LIKE LOWER(@query)
        """

    base_query += """
        ORDER BY CREATED_AT DESC
        LIMIT @limit
    """

    return query_bq(base_query, {
        "limit": limit,
        "query": f"%{query}%" if query else None,
    })
