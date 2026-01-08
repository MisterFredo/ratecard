from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET
from api.public.models import (
    HomeContinuousResponse,
    HomeContinuousItem,
    HomeNewsResponse,
    HomeNewsItem,
    HomeEventsResponse,
    HomeEventBlock,
    HomeEventInfo,
    HomeEventContentItem,
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
    except Exception:
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


# ============================================================
# HOME — NEWS BLOCK
# ============================================================
@router.get(
    "/home/news",
    response_model=HomeNewsResponse
)
def get_home_news():
    """
    Retourne les 4 news affichées sur la Home.
    Une news sans visuel rectangulaire est exclue.
    """
    client = get_bigquery_client()

    query = f"""
    SELECT
      ID_NEWS AS id,
      TITLE AS title,
      EXCERPT AS excerpt,
      PUBLISHED_AT AS published_at,
      VISUAL_RECT_URL AS visual_rect_url
    FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS`
    WHERE
      IS_PUBLISHED = true
      AND VISUAL_RECT_URL IS NOT NULL
    ORDER BY PUBLISHED_AT DESC
    LIMIT 4
    """

    try:
        rows = client.query(query).result()
    except Exception:
        logger.exception("Erreur BigQuery — home news")
        raise HTTPException(500, "Erreur récupération news home")

    items = [
        HomeNewsItem(
            id=row["id"],
            title=row["title"],
            excerpt=row["excerpt"],
            published_at=row["published_at"],
            visual_rect_url=row["visual_rect_url"],
        )
        for row in rows
    ]

    return HomeNewsResponse(items=items)


# ============================================================
# HOME — EVENTS BLOCKS
# ============================================================
@router.get(
    "/home/events",
    response_model=HomeEventsResponse
)
def get_home_events():
    """
    Retourne les blocs Events affichés sur la Home,
    avec leurs analyses associées.
    """
    client = get_bigquery_client()

    # ----------------------------
    # 1) EVENTS ACTIFS HOME
    # ----------------------------
    events_query = f"""
    SELECT
      ID_EVENT AS id,
      LABEL AS label,
      HOME_LABEL AS home_label,
      VISUAL_RECT_URL AS visual_rect_url
    FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_EVENT`
    WHERE IS_ACTIVE_HOME = true
    ORDER BY HOME_ORDER
    """

    try:
        event_rows = client.query(events_query).result()
    except Exception:
        logger.exception("Erreur BigQuery — home events (events)")
        raise HTTPException(500, "Erreur récupération events home")

    events = [dict(row) for row in event_rows]

    if not events:
        return HomeEventsResponse(events=[])

    event_ids = [e["id"] for e in events]

    # ----------------------------
    # 2) ANALYSES PAR EVENT
    # ----------------------------
    contents_query = f"""
    SELECT
      ID_EVENT AS event_id,
      ID_CONTENT AS id,
      TITLE AS title,
      EXCERPT AS excerpt,
      PUBLISHED_AT AS published_at
    FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT`
    WHERE
      IS_PUBLISHED = true
      AND ID_EVENT IN UNNEST(@event_ids)
    ORDER BY PUBLISHED_AT DESC
    """

    job_config = client.query(
        contents_query,
        job_config={
            "query_parameters": [
                {
                    "name": "event_ids",
                    "parameterType": {"type": "ARRAY", "arrayType": {"type": "STRING"}},
                    "parameterValue": {"arrayValues": [{"value": eid} for eid in event_ids]},
                }
            ]
        },
    )

    try:
        content_rows = job_config.result()
    except Exception:
        logger.exception("Erreur BigQuery — home events (contents)")
        raise HTTPException(500, "Erreur récupération contenus events")

    contents_by_event = {}
    for row in content_rows:
        contents_by_event.setdefault(row["event_id"], []).append(row)

    # ----------------------------
    # 3) BUILD RESPONSE
    # ----------------------------
    blocks = []

    for event in events:
        rows = contents_by_event.get(event["id"], [])[:4]

        contents = [
            HomeEventContentItem(
                id=row["id"],
                title=row["title"],
                excerpt=row["excerpt"],
                published_at=row["published_at"],
            )
            for row in rows
        ]

        blocks.append(
            HomeEventBlock(
                event=HomeEventInfo(
                    id=event["id"],
                    label=event["label"],
                    home_label=event["home_label"],
                    visual_rect_url=event["visual_rect_url"],
                ),
                contents=contents,
            )
        )

    return HomeEventsResponse(events=blocks)
