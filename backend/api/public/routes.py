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
from core.event.service import list_home_events, list_event_contents

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================================
# HOME — NEWS (CARTES)
# ============================================================
@router.get("/home/news", response_model=HomeNewsResponse)
def get_home_news():
    try:
        news = list_news()

        items = [
            HomeNewsItem(
                id=n["ID_NEWS"],
                title=n["TITLE"],
                excerpt=n.get("EXCERPT"),
                published_at=n["PUBLISHED_AT"],
                visual_rect_url=n["VISUAL_RECT_URL"],
            )
            for n in news
            if n["STATUS"] == "PUBLISHED" and n.get("VISUAL_RECT_URL")
        ]

        return HomeNewsResponse(items=items[:4])

    except Exception:
        logger.exception("Erreur home news")
        raise HTTPException(500, "Erreur récupération home news")


# ============================================================
# HOME — ANALYSES PAR EVENT (LIGNES + ENRICHISSEMENTS)
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
                    topics=(c.get("topics") or [])[:2],
                    key_metrics=(c.get("chiffres") or [])[:2],
                )
                for c in contents[:4]
            ]

            blocks.append(
                HomeEventBlock(
                    event=HomeEventInfo(
                        id=e["id"],
                        label=e["label"],
                        home_label=e["home_label"],
                        event_color=e.get("event_color"),
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
# PUBLIC — READ ANALYSIS (DRAWER)
# ============================================================
@router.get("/content/{id_content}")
def read_content(id_content: str):
    try:
        contents = list_contents()
        c = next((x for x in contents if x["id"] == id_content), None)

        if not c:
            raise HTTPException(404, "Analyse introuvable")

        return {
            "id_content": c["id"],
            "angle_title": c["title"],
            "angle_signal": c.get("signal"),
            "excerpt": c.get("excerpt"),
            "concept": c.get("concept"),
            "content_body": c.get("content_body"),
            "chiffres": c.get("chiffres") or [],
            "citations": c.get("citations") or [],
            "acteurs_cites": c.get("acteurs_cites") or [],
            "published_at": c["published_at"],
            "event": (
                {
                    "id": c["event"]["id"],
                    "label": c["event"]["label"],
                }
                if c.get("event")
                else None
            ),
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur read_content")
        raise HTTPException(500, "Erreur lecture analyse")


# ============================================================
# PUBLIC — LIST ANALYSES (EXACTEMENT COMME HOME, SANS LIMITE)
# ============================================================
@router.get("/analysis/list")
def list_public_analyses():
    try:
        events = list_home_events()
        items = []

        for e in events:
            contents = list_event_contents(e["id"])  # PAS de limite

            for c in contents:
                items.append(
                    {
                        "id": c["id"],
                        "title": c["title"],
                        "excerpt": c.get("excerpt"),
                        "published_at": c["published_at"],
                        "topics": c.get("topics") or [],
                        "key_metrics": c.get("chiffres") or [],
                        "event": {
                            "id": e["id"],
                            "label": e["label"],
                            "event_color": e.get("event_color"),
                        },
                    }
                )

        # tri global décroissant
        items.sort(
            key=lambda x: x["published_at"], reverse=True
        )

        return {"items": items}

    except Exception:
        logger.exception("Erreur list_public_analyses")
        raise HTTPException(500, "Erreur récupération analyses")

