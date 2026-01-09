from fastapi import APIRouter, HTTPException
import logging

from api.public.models import (
    HomeNewsResponse,
    HomeNewsItem,
    HomeEventsResponse,
    HomeEventBlock,
    HomeEventInfo,
    HomeAnalysisLine,
    DrawerNewsResponse,
    DrawerAnalysisResponse,
)

from core.news.service import list_news
from core.content.service import list_contents
from core.event.service import (
    list_home_events,
    list_event_contents,
    get_event_by_slug,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================================
# HOME — NEWS (CARTES)
# ============================================================
@router.get("/home/news", response_model=HomeNewsResponse)
def get_home_news():
    try:
        news = list_news()
        items = []

        for n in news:
            if n["STATUS"] == "PUBLISHED" and n.get("VISUAL_RECT_URL"):
                items.append(
                    HomeNewsItem(
                        id=n["ID_NEWS"],
                        title=n["TITLE"],
                        excerpt=n.get("EXCERPT"),
                        published_at=n["PUBLISHED_AT"],
                        visual_rect_url=n["VISUAL_RECT_URL"],
                    )
                )

        return HomeNewsResponse(items=items[:4])

    except Exception:
        logger.exception("Erreur home news")
        raise HTTPException(500, "Erreur récupération home news")


# ============================================================
# HOME — ANALYSES PAR EVENT (LIGNES)
# ============================================================
@router.get("/home/events", response_model=HomeEventsResponse)
def get_home_events():
    try:
        events = list_home_events()
        blocks = []

        for e in events:
            contents = list_event_contents(e["id"])

            analyses = [
                HomeAnalysisLine(
                    id=c["id"],
                    title=c["title"],
                    published_at=c["published_at"],
                )
                for c in contents[:4]
            ]

            blocks.append(
                HomeEventBlock(
                    event=HomeEventInfo(
                        id=e["id"],
                        label=e["label"],
                        home_label=e["home_label"],
                        color=e.get("color"),
                    ),
                    analyses=analyses,
                )
            )

        return HomeEventsResponse(events=blocks)

    except Exception:
        logger.exception("Erreur home events")
        raise HTTPException(500, "Erreur récupération home events")


# ============================================================
# DRAWER — NEWS
# ============================================================
@router.get("/news/{id_news}", response_model=DrawerNewsResponse)
def read_news(id_news: str):
    try:
        rows = list_news()
        n = next((x for x in rows if x["ID_NEWS"] == id_news), None)

        if not n or n["STATUS"] != "PUBLISHED":
            raise HTTPException(404, "News introuvable")

        return DrawerNewsResponse(
            id_news=n["ID_NEWS"],
            title=n["TITLE"],
            excerpt=n.get("EXCERPT"),
            body=n.get("BODY"),
            published_at=n["PUBLISHED_AT"],
            visual_rect_url=n["VISUAL_RECT_URL"],
            company={
                "id_company": n["ID_COMPANY"],
                "name": n["COMPANY_NAME"],
            },
        )

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur read_news")
        raise HTTPException(500, "Erreur lecture news")


# ============================================================
# DRAWER — ANALYSE
# ============================================================
@router.get("/content/{id_content}", response_model=DrawerAnalysisResponse)
def read_content(id_content: str):
    try:
        contents = list_contents()
        c = next((x for x in contents if x["ID_CONTENT"] == id_content), None)

        if not c or c["STATUS"] != "PUBLISHED":
            raise HTTPException(404, "Analyse introuvable")

        event = None
        if c.get("EVENT_ID"):
            event = {
                "id": c["EVENT_ID"],
                "label": c.get("EVENT_LABEL"),
            }

        return DrawerAnalysisResponse(
            id_content=c["ID_CONTENT"],
            angle_title=c["ANGLE_TITLE"],
            angle_signal=c["ANGLE_SIGNAL"],
            excerpt=c.get("EXCERPT"),
            concept=c.get("CONCEPT"),
            content_body=c.get("CONTENT_BODY"),
            chiffres=c.get("CHIFFRES") or [],
            citations=c.get("CITATIONS") or [],
            acteurs_cites=c.get("ACTEURS_CITES") or [],
            published_at=c["PUBLISHED_AT"],
            event=event,
        )

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur read_content")
        raise HTTPException(500, "Erreur lecture analyse")


# ============================================================
# PAGE EVENT — META
# ============================================================
@router.get("/event/{slug}")
def read_event(slug: str):
    event = get_event_by_slug(slug)
    if not event:
        raise HTTPException(404, "Événement introuvable")
    return event


# ============================================================
# PAGE EVENT — ANALYSES (PROJECTION LEGERE)
# ============================================================
@router.get("/event/{slug}/contents")
def read_event_contents(slug: str):
    event = get_event_by_slug(slug)
    if not event:
        raise HTTPException(404, "Événement introuvable")

    contents = list_event_contents(event["id_event"])

    return {
        "items": [
            {
                "id": c["id"],
                "title": c["title"],
                "excerpt": c.get("excerpt"),
                "published_at": c["published_at"],
                "topics": c.get("topics", []),
            }
            for c in contents
        ]
    }

# ============================================================
# PUBLIC — LIST ANALYSES (PAGE /analysis)
# ============================================================
@router.get("/analysis/list")
def list_public_analyses():
    """
    Liste complète des analyses publiées (projection légère).
    """
    try:
        contents = list_contents()

        items = []
        for c in contents:
            if c["STATUS"] != "PUBLISHED" or not c.get("IS_ACTIVE"):
                continue

            event = None
            if c.get("EVENT_ID"):
                event = {
                    "id": c.get("EVENT_ID"),
                    "label": c.get("EVENT_LABEL"),
                    "event_color": c.get("EVENT_COLOR"),
                }

            items.append(
                {
                    "id": c["ID_CONTENT"],
                    "title": c["ANGLE_TITLE"],
                    "excerpt": c.get("EXCERPT"),
                    "published_at": c["PUBLISHED_AT"],
                    "event": event,
                }
            )

        return {"items": items}

    except Exception:
        logger.exception("Erreur list_public_analyses")
        raise HTTPException(500, "Erreur récupération analyses")

