from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET
from api.public.models import (
    HomeContinuousResponse,
    HomeContinuousItem,
)

import logging
logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================
# HOME — CONTINUOUS BAND
# ============================================================
@router.get(
    "/home/continuous",
    response_model=HomeContinuousResponse
)
def get_home_continuous():
    """
    Retourne les 5 derniers contenus publiés (News + Analyses),
    triés par date décroissante.
    """
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

    try:
        rows = client.query(query).result()
    except Exception as e:
        logger.exception("Erreur BigQuery — home continuous")
        raise HTTPException(500, "Erreur récupération flux continu")

    items = [
        HomeContinuousItem(
            type=row["type"],
            id=row["id"],
            title=row["title"],
            published_at=row["published_at"],
        )
        for row in rows
    ]

    return HomeContinuousResponse(items=items)
