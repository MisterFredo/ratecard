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
                            "events",
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

# ============================================================
# PUBLIC — READ NEWS (DRAWER)
# ============================================================
@router.get("/news/{id_news}")
def read_news(id_news: str):
    client = get_bigquery_client()

    try:
        # ----------------------------
        # NEWS
        # ----------------------------
        rows = query_bq(
            f"""
            SELECT *
            FROM `{DATASET}.RATECARD_NEWS`
            WHERE ID_NEWS = @id
              AND STATUS = 'PUBLISHED'
              AND IS_ACTIVE = true
            LIMIT 1
            """,
            {"id": id_news},
        )

        if not rows:
            raise HTTPException(404, "News introuvable")

        n = rows[0]

        # ----------------------------
        # COMPANY
        # ----------------------------
        company = query_bq(
            f"""
            SELECT ID_COMPANY, NAME, MEDIA_LOGO_RECTANGLE_ID
            FROM `{DATASET}.RATECARD_COMPANY`
            WHERE ID_COMPANY = @id
            """,
            {"id": n["ID_COMPANY"]},
        )

        # ----------------------------
        # TOPICS
        # ----------------------------
        topics = query_bq(
            f"""
            SELECT T.ID_TOPIC, T.LABEL
            FROM `{DATASET}.RATECARD_NEWS_TOPIC` NT
            JOIN `{DATASET}.RATECARD_TOPIC` T
              ON NT.ID_TOPIC = T.ID_TOPIC
            WHERE NT.ID_NEWS = @id
            """,
            {"id": id_news},
        )

        # ----------------------------
        # PERSONS
        # ----------------------------
        persons = query_bq(
            f"""
            SELECT P.ID_PERSON, P.NAME, P.TITLE
            FROM `{DATASET}.RATECARD_NEWS_PERSON` NP
            JOIN `{DATASET}.RATECARD_PERSON` P
              ON NP.ID_PERSON = P.ID_PERSON
            WHERE NP.ID_NEWS = @id
            """,
            {"id": id_news},
        )

        return {
            "type": "news",
            "id_news": n["ID_NEWS"],
            "title": n["TITLE"],
            "excerpt": n.get("EXCERPT"),
            "body": n.get("BODY"),
            "status": n["STATUS"],
            "published_at": n["PUBLISHED_AT"],
            "author": n.get("AUTHOR"),
            "source_url": n.get("SOURCE_URL"),
            "visual_rect_url": get_public_url(
                "news", n.get("MEDIA_RECTANGLE_ID")
            ),
            "company": company[0] if company else None,
            "topics": topics,
            "persons": persons,
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur read_news")
        raise HTTPException(500, "Erreur lecture news")

# ============================================================
# PUBLIC — READ CONTENT (DRAWER)
# ============================================================
@router.get("/content/{id_content}")
def read_content(id_content: str):
    client = get_bigquery_client()

    try:
        # ----------------------------
        # CONTENT
        # ----------------------------
        rows = query_bq(
            f"""
            SELECT *
            FROM `{DATASET}.RATECARD_CONTENT`
            WHERE ID_CONTENT = @id
              AND STATUS = 'PUBLISHED'
              AND IS_ACTIVE = true
            LIMIT 1
            """,
            {"id": id_content},
        )

        if not rows:
            raise HTTPException(404, "Contenu introuvable")

        c = rows[0]

        # ----------------------------
        # EVENTS
        # ----------------------------
        events = query_bq(
            f"""
            SELECT E.ID_EVENT, E.LABEL
            FROM `{DATASET}.RATECARD_CONTENT_EVENT` CE
            JOIN `{DATASET}.RATECARD_EVENT` E
              ON CE.ID_EVENT = E.ID_EVENT
            WHERE CE.ID_CONTENT = @id
            """,
            {"id": id_content},
        )

        return {
            "type": "content",
            "id_content": c["ID_CONTENT"],
            "title": c["ANGLE_TITLE"],
            "excerpt": c.get("EXCERPT"),
            "concept": c.get("CONCEPT"),
            "content_body": c.get("CONTENT_BODY"),
            "status": c["STATUS"],
            "published_at": c["PUBLISHED_AT"],
            "seo_title": c.get("SEO_TITLE"),
            "seo_description": c.get("SEO_DESCRIPTION"),
            "citations": c.get("CITATIONS"),
            "chiffres": c.get("CHIFFRES"),
            "acteurs_cites": c.get("ACTEURS_CITES"),
            "events": events,
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur read_content")
        raise HTTPException(500, "Erreur lecture contenu")

# ============================================================
# PUBLIC — READ EVENT (BY SLUG)
# ============================================================
@router.get("/event/{slug}")
def read_event(slug: str):
    try:
        rows = query_bq(
            f"""
            SELECT
              ID_EVENT,
              LABEL,
              HOME_LABEL,
              DESCRIPTION,
              MEDIA_RECTANGLE_ID
            FROM `{DATASET}.RATECARD_EVENT`
            WHERE
              IS_ACTIVE = true
              AND LOWER(REPLACE(HOME_LABEL, ' ', '-')) = @slug
            LIMIT 1
            """,
            {"slug": slug},
        )

        if not rows:
            raise HTTPException(404, "Événement introuvable")

        e = rows[0]

        return {
            "id_event": e["ID_EVENT"],
            "label": e["LABEL"],
            "home_label": e["HOME_LABEL"],
            "description": e.get("DESCRIPTION"),
            "visual_rect_url": get_public_url(
                "events",
                e.get("MEDIA_RECTANGLE_ID"),
            ),
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur read_event")
        raise HTTPException(500, "Erreur lecture événement")

# ============================================================
# PUBLIC — READ EVENT CONTENTS
# ============================================================
@router.get("/event/{slug}/contents")
def read_event_contents(slug: str):
    try:
        rows = query_bq(
            f"""
            SELECT
              C.ID_CONTENT AS id,
              C.ANGLE_TITLE AS title,
              C.EXCERPT AS excerpt,
              C.PUBLISHED_AT
            FROM `{DATASET}.RATECARD_CONTENT_EVENT` CE
            JOIN `{DATASET}.RATECARD_CONTENT` C
              ON CE.ID_CONTENT = C.ID_CONTENT
            JOIN `{DATASET}.RATECARD_EVENT` E
              ON CE.ID_EVENT = E.ID_EVENT
            WHERE
              C.STATUS = 'PUBLISHED'
              AND C.IS_ACTIVE = true
              AND E.IS_ACTIVE = true
              AND LOWER(REPLACE(E.HOME_LABEL, ' ', '-')) = @slug
            ORDER BY C.PUBLISHED_AT DESC
            """,
            {"slug": slug},
        )

        return {
            "items": rows
        }

    except Exception:
        logger.exception("Erreur read_event_contents")
        raise HTTPException(500, "Erreur lecture contenus événement")


