from fastapi import APIRouter
from utils.bigquery_utils import get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter(prefix="/api/public/home", tags=["public-home"])


@router.get("/continuous")
def get_home_continuous():
    client = get_bigquery_client()

    query = f"""
    SELECT
      'news' AS type,
      ID_NEWS AS id,
      TITLE AS title,
      PUBLISHED_AT AS published_at
    FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS`
    WHERE IS_PUBLISHED = true

    UNION ALL

    SELECT
      'content' AS type,
      ID_CONTENT AS id,
      TITLE AS title,
      PUBLISHED_AT AS published_at
    FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT`
    WHERE IS_PUBLISHED = true

    ORDER BY published_at DESC
    LIMIT 5
    """

    rows = client.query(query).result()

    items = [
        {
            "type": row["type"],
            "id": row["id"],
            "title": row["title"],
            "published_at": row["published_at"].isoformat(),
        }
        for row in rows
    ]

    return {"items": items}
