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
@router.get("/home/continuous", response_model=HomeContinuousResponse)
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

    try:
        rows = client.query(query).result()
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
    except Exception:
        logger.exception("Erreur home continuous")
        raise HTTPException(500, "Erreur récupération home continuous")


# ============================================================
# HOME — NEWS BLOCK
# ============================================================
@router.get("/home/news", response_model=HomeNewsResponse)
def get_home_news():
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
    except Exception:
        logger.exception("Erreur home news")
        raise HTTPException(500, "Erreur récupération home news")


# ============================================================
# HOME — EVENTS BLOCKS
# ============================================================
@router.get("/home/events", response_model=HomeEventsResponse)
def get_home_events():
    client = get_bigquery_client()

    try:
        # 1) Events actifs
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
        event_rows = list(client.query(events_query).result())
        events = [dict(row) for row in event_rows]

        if not events:
            return HomeEventsResponse(events=[])

        # 2) Contents liés
        event_ids = [f"'{e['id']}'" for e in events]
        ids_sql = ",".join(event_ids)

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
          AND ID_EVENT IN ({ids_sql})
        ORDER BY PUBLISHED_AT DESC
        """

        content_rows = client.query(contents_query).result()

        contents_by_event = {}
        for row in content_rows:
            contents_by_event.setdefault(row["event_id"], []).append(row)

        # 3) Build response
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

    except Exception:
        logger.exception("Erreur home events")
        raise HTTPException(500, "Erreur récupération home events")

