from fastapi import APIRouter, HTTPException
import logging

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

# CORE SERVICES
from core.event.service import (
    get_event_by_slug,
    list_home_events,
    list_event_contents,
)

from core.news.service import list_news
from core.content.service import list_contents

logger = logging.getLogger(__name__)
router = APIRouter()

DATASET = "adex-5555.RATECARD"


# ============================================================
# HOME — CONTINUOUS BAND
# ============================================================
@router.get("/home/continuous", response_model=HomeContinuousResponse)
def get_home_continuous():
    """
    5 derniers contenus publiés (News + Analyses)
    """
    client = get_bigquery_client()

    query = f"""
    SELECT
      'news' AS type,
      ID_NEWS AS id,
      TITLE AS title,
      PUBLISHED_AT AS published_at
    FROM `{DATASET}.RATECARD_NEWS`
    WHERE STATUS = 'PUBLISHED' AND IS_ACTIVE = true

    UNION ALL

    SELECT
      'content' AS type,
      ID_CONTENT AS id,
      ANGLE_TITLE AS title,
      PUBLISHED_AT AS published_at
    FROM `{DATASET}.RATECARD_CONTENT`
    WHERE STATUS = 'PUBLISHED' AND IS_ACTIVE = true

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
    """
    Dernières News (utilise le core News)
    """
    try:
        news = list_news()

        items = []
        for n in news:
            if (
                n["STATUS"] == "PUBLISHED"
                and n.get("VISUAL_RECT_URL")
            ):
                items.append(
                    HomeNewsItem(
                        id=n["ID_NEWS"],
                        title=n["TITLE"],
                        excerpt=n.get("EXCERPT") or "",
                        published_at=n["PUBLISHED_AT"],
                        visual_rect_url=n["VISUAL_RECT_URL"],
                    )
                )

        return HomeNewsResponse(items=items[:4])

    except Exception:
        logger.exception("Erreur home news")
        raise HTTPException(500, "Erreur récupération home news")


# ============================================================
# HOME — EVENTS BLOCKS
# ============================================================
@router.get("/home/events", response_model=HomeEventsResponse)
def get_home_events():
    """
    Rubriques Events pour la Home
    """
    try:
        events = list_home_events()
        blocks = []

        for e in events:
            contents = list_event_contents(e["id"])

            blocks.append(
                HomeEventBlock(
                    event=HomeEventInfo(
                        id=e["id"],
                        label=e["label"],
                        home_label=e["home_label"],
                        visual_rect_url=e["visual_rect_url"],
                    ),
                    contents=[
                        HomeEventContentItem(
                            id=c["id"],
                            title=c["title"],
                            excerpt=c.get("excerpt") or "",
                            published_at=c["published_at"],
                        )
                        for c in contents[:4]
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
    """
    Lecture d'une News (drawer)
    """
    try:
        # on réutilise le core existant
        rows = list_news()
        n = next((x for x in rows if x["ID_NEWS"] == id_news), None)

        if not n or n["STATUS"] != "PUBLISHED":
            raise HTTPException(404, "News introuvable")

        return {
            "type": "news",
            "id_news": n["ID_NEWS"],
            "title": n["TITLE"],
            "excerpt": n.get("EXCERPT"),
            "body": n.get("BODY"),
            "status": n["STATUS"],
            "published_at": n["PUBLISHED_AT"],
            "visual_rect_url": n["VISUAL_RECT_URL"],
            "company": {
                "id_company": n["ID_COMPANY"],
                "name": n["COMPANY_NAME"],
            },
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
    """
    Lecture d'une Analyse (drawer)
    """
    try:
        contents = list_contents()
        c = next((x for x in contents if x["ID_CONTENT"] == id_content), None)

        if not c or c["STATUS"] != "PUBLISHED":
            raise HTTPException(404, "Contenu introuvable")

        return {
            "type": "content",
            "id_content": c["ID_CONTENT"],
            "title": c["TITLE"],
            "excerpt": c.get("EXCERPT"),
            "content_body": c.get("CONTENT_BODY"),
            "status": c["STATUS"],
            "published_at": c["PUBLISHED_AT"],
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
    """
    Lecture d'un Event par slug
    """
    event = get_event_by_slug(slug)
    if not event:
        raise HTTPException(404, "Événement introuvable")
    return event


# ============================================================
# PUBLIC — READ EVENT CONTENTS
# ============================================================
@router.get("/event/{slug}/contents")
def read_event_contents(slug: str):
    """
    Analyses liées à un Event
    """
    event = get_event_by_slug(slug)
    if not event:
        raise HTTPException(404, "Événement introuvable")

    contents = list_event_contents(event["id_event"])
    return {"items": contents}
