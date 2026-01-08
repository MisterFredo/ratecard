from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import get_bigquery_client
from utils.gcs import get_public_url
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

DATASET = "adex-5555.RATECARD"


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
    FROM `{DATASET}.RATECARD_NEWS`
    WHERE
      STATUS = 'PUBLISHED'
      AND IS_ACTIVE = true

    UNION ALL

    SELECT
      'content' AS type,
      ID_CONTENT AS id,
      ANGLE_TITLE AS title,
      PUBLISHED_AT AS published_at
    FROM `{DATASET}.RATECARD_CONTENT`
    WHERE
      STATUS = 'PUBLISHED'
      AND IS_ACTIVE = true

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
      MEDIA_RECTANGLE_ID
    FROM `{DATASET}.RATECARD_NEWS`
    WHERE
      STATUS = 'PUBLISHED'
      AND IS_ACTIVE = true
      AND MEDIA_RECTANGLE_ID IS NOT NULL
    ORDER BY PUBLISHED_AT DESC
    LIMIT 4
    """

    try:
        rows = client.query(query).result()
        items = [
            HomeNewsItem(
                id=row["id"],
                title=row["title"],
                excerpt=row["excerpt"] or "",
                published_at=row["published_at"],
                visual_rect_url=get_public_url(
                    "news",
                    row["MEDIA_RECTANGLE_ID"],
                ),
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
        # ----------------------------------------------------
        # 1) EVENTS ACTIFS HOME (VISUEL OBLIGATOIRE)
        # ----------------------------------------------------
        events_query = f"""
        SELECT
          ID_EVENT AS id,
          LABEL AS label,
          HOME_LABEL AS home_label,
          MEDIA_RECTANGLE_ID
        FROM `{DATASET}.RATECARD_EVENT`
        WHERE
          IS_ACTIVE_HOME = true
          AND IS_ACTIVE = true
          AND MEDIA_RECTANGLE_ID IS NOT NULL
        ORDER BY HOME_ORDER
        """

        event_rows = list(client.query(events_query).result())
        events = [dict(row) for row in event_rows]

        if not events:
            return HomeEventsResponse(events=[])

        # ----------------------------------------------------
        # 2) CONTENTS LIÉS AUX EVENTS
        # ----------------------------------------------------
        event_ids_sql = ",".join([f"'{e['id']}'" for e in events])

        contents_query = f"""
        SELECT
          ce.ID_EVENT AS event_id,
          c.ID_CONTENT AS id,
          c.ANGLE_TITLE AS title,
          c.EXCERPT AS excerpt,
          c.PUBLISHED_AT AS published_at
        FROM `{DATASET}.RATECARD_CONTENT_EVENT` ce
        JOIN `{DATASET}.RATECARD_CONTENT` c
          ON c.ID_CONTENT = ce.ID_CONTENT
        WHERE
          c.STATUS = 'PUBLISHED'
          AND c.IS_ACTIVE = true
          AND ce.ID_EVENT IN ({event_ids_sql})
        ORDER BY c.PUBLISHED_AT DESC
        """

        content_rows = client.query(contents_query).result()

        contents_by_event = {}
        for row in content_rows:
            contents_by_event.setdefault(row["event_id"], []).append(row)

        # ----------------------------------------------------
        # 3) BUILD RESPONSE
        # ----------------------------------------------------
        blocks = []

        for event in events:
            rows = contents_by_event.get(event["id"], [])[:4]

            blocks.append(
                HomeEventBlock(
                    event=HomeEventInfo(
                        id=event["id"],
                        label=event["label"],
                        home_label=event["home_label"],
                        visual_rect_url=get_public_url(
                            "event",
                            event["MEDIA_RECTANGLE_ID"],
                        ),
                    ),
                    contents=[
                        HomeEventContentItem(
                            id=row["id"],
                            title=row["title"],
                            excerpt=row["excerpt"] or "",
                            published_at=row["published_at"],
                        )
                        for row in rows
                    ],
                )
            )

        return HomeEventsResponse(events=blocks)

    except Exception:
        logger.exception("Erreur home events")
        raise HTTPException(500, "Erreur récupération home events")
