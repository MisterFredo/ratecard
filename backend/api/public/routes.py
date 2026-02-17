from fastapi import APIRouter, HTTPException
import logging
import os
import requests

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq

from api.public.models import (
    HomeNewsResponse,
    HomeNewsItem,
    HomeEventsResponse,
    HomeEventBlock,
    HomeEventInfo,
    HomeAnalysisLine,
    DrawerNewsResponse,
    DrawerAnalysisResponse,
    PublicMembersResponse,
    PublicMemberResponse,
    LinkedInGenerateRequest,
    NewsletterSubscribeRequest,      # ✅ AJOUT
    NewsletterSubscribeResponse,     # ✅ AJOUT
)

from core.news.service import list_news
from core.content.service import list_contents
from core.event.service import list_home_events, list_event_contents
from core.linkedin.generate_post import generate_linkedin_post

logger = logging.getLogger(__name__)
router = APIRouter()



# ============================================================
# HOME — ANALYSES PAR EVENT (LIGNES + CONTEXTE)
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
                    key_metrics=(c.get("key_metrics") or [])[:2],
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
                        context_html=e.get("context_html"),
                    ),
                    analyses=analyses,
                )
            )

        return HomeEventsResponse(events=blocks)

    except Exception:
        logger.exception("Erreur home events")
        raise HTTPException(500, "Erreur récupération home events")


# ============================================================
# NAV — EVENTS (SIDEBAR)
# ============================================================
@router.get("/nav/events")
def get_nav_events():
    """
    Événements pour la navigation (sidebar).
    Uniquement des liens externes cliquables.
    """
    try:
        rows = query_bq(
            f"""
            SELECT
              LABEL,
              EXTERNAL_URL
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_EVENT`
            WHERE
              IS_ACTIVE = TRUE
              AND IS_ACTIVE_NAV = TRUE
              AND EXTERNAL_URL IS NOT NULL
            ORDER BY HOME_ORDER ASC
            """
        )

        return {
            "events": [
                {
                    "label": r["LABEL"],
                    "url": r["EXTERNAL_URL"],
                }
                for r in rows
            ]
        }

    except Exception:
        logger.exception("Erreur nav events")
        raise HTTPException(500, "Erreur récupération nav events")


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

            # 🔑 visuel news uniquement (peut être null)
            visual_rect_id=n.get("VISUAL_RECT_ID"),

            # 🔑 société enrichie pour fallback visuel
            company={
                "id_company": n["ID_COMPANY"],
                "name": n["COMPANY_NAME"],
                "media_logo_rectangle_id": n.get(
                    "MEDIA_LOGO_RECTANGLE_ID"
                ),
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
            "angle_signal": c["signal"],
            "excerpt": c.get("excerpt"),
            "concept": c.get("concept"),
            "content_body": c.get("content_body"),
            "chiffres": c.get("chiffres") or [],
            "citations": c.get("citations") or [],
            "acteurs_cites": c.get("acteurs_cites") or [],
            "published_at": c["published_at"],
            "event": c.get("event"),
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur read_content")
        raise HTTPException(500, "Erreur lecture analyse")


# ============================================================
# PUBLIC — LIST ANALYSES (FLUX CHRONOLOGIQUE)
# ============================================================
@router.get("/analysis/list")
def list_public_analyses():
    try:
        events = list_home_events()
        items = []

        for e in events:
            contents = list_event_contents(e["id"])

            for c in contents:
                items.append(
                    {
                        "id": c["id"],
                        "title": c["title"],
                        "excerpt": c.get("excerpt"),
                        "published_at": c["published_at"],
                        "topics": c.get("topics") or [],
                        "key_metrics": c.get("key_metrics") or [],
                        "event": {
                            "id": e["id"],
                            "label": e["label"],
                            # ✅ AJOUT CRUCIAL
                            "home_label": e.get("home_label"),
                            "event_color": e.get("event_color"),
                        },
                    }
                )

        items.sort(key=lambda x: x["published_at"], reverse=True)
        return {"items": items}

    except Exception:
        logger.exception("Erreur list_public_analyses")
        raise HTTPException(500, "Erreur récupération analyses")


# ============================================================
# LINKEDIN — GÉNÉRATION POST IA
# ============================================================
@router.post("/linkedin/generate")
def generate_linkedin_post_route(payload: LinkedInGenerateRequest):
    """
    Génère un texte LinkedIn à partir de sources News / Analyses.
    Retourne toujours une string (vide si échec).
    """
    try:
        text = generate_linkedin_post(
            sources=[s.dict() for s in payload.sources]
        )

        return {
            "text": text or ""
        }

    except Exception:
        logger.exception("Erreur génération post LinkedIn")
        return {
            "text": ""
        }

from api.public.models import (
    PublicMembersResponse,
    PublicMemberResponse,
)

# ============================================================
# MEMBERS — LISTE DES PARTENAIRES
# ============================================================
@router.get(
    "/members",
    response_model=PublicMembersResponse
)
def get_members():
    """
    Retourne la liste des sociétés partenaires (public).
    """
    try:
        rows = query_bq(
            f"""
            SELECT
                ID_COMPANY,
                NAME,
                DESCRIPTION,
                MEDIA_LOGO_RECTANGLE_ID
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY`
            WHERE
                IS_PARTNER = TRUE
                AND IS_ACTIVE = TRUE
            ORDER BY NAME ASC
            """
        )

        items = [
            {
                "id_company": r["ID_COMPANY"],
                "name": r["NAME"],
                "description": r.get("DESCRIPTION"),
                "media_logo_rectangle_id": r.get("MEDIA_LOGO_RECTANGLE_ID"),
            }
            for r in rows
        ]

        return {"items": items}

    except Exception:
        logger.exception("Erreur récupération membres")
        raise HTTPException(
            500,
            "Erreur récupération membres"
        )


# ============================================================
# MEMBER — FICHE PARTENAIRE + NEWS
# ============================================================
@router.get(
    "/member/{id_company}",
    response_model=PublicMemberResponse
)
def get_member(id_company: str):
    """
    Retourne la fiche d’un partenaire + ses news publiées.
    Utilisé par le drawer gauche.
    """
    try:
        # --- Société
        company_rows = query_bq(
            f"""
            SELECT
                ID_COMPANY,
                NAME,
                DESCRIPTION,
                MEDIA_LOGO_RECTANGLE_ID
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY`
            WHERE
                ID_COMPANY = @id
                AND IS_PARTNER = TRUE
                AND IS_ACTIVE = TRUE
            """,
            {"id": id_company},
        )

        if not company_rows:
            raise HTTPException(
                404,
                "Partenaire introuvable"
            )

        c = company_rows[0]

        # --- News du partenaire
        news_rows = query_bq(
            f"""
            SELECT
                ID_NEWS,
                TITLE,
                EXCERPT,
                PUBLISHED_AT
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS`
            WHERE
                ID_COMPANY = @id
                AND STATUS = 'PUBLISHED'
            ORDER BY PUBLISHED_AT DESC
            """,
            {"id": id_company},
        )

        news = [
            {
                "id_news": n["ID_NEWS"],
                "title": n["TITLE"],
                "excerpt": n.get("EXCERPT"),
                "published_at": n["PUBLISHED_AT"],
            }
            for n in news_rows
        ]

        return {
            "id_company": c["ID_COMPANY"],
            "name": c["NAME"],
            "description": c.get("DESCRIPTION"),
            "media_logo_rectangle_id": c.get("MEDIA_LOGO_RECTANGLE_ID"),
            "news": news,
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur récupération membre")
        raise HTTPException(
            500,
            "Erreur récupération membre"
        )

# ============================================================
# NEWSLETTER — SUBSCRIBE (BREVO)
# ============================================================

@router.post(
    "/newsletter/subscribe",
    response_model=NewsletterSubscribeResponse
)
def subscribe_newsletter(payload: NewsletterSubscribeRequest):
    """
    Inscrit un email aux listes Newsletter Brevo (main + partners).
    """
    try:
        BREVO_API_KEY = os.getenv("BREVO_API_KEY")
        BREVO_LIST_ID_MAIN = os.getenv("BREVO_LIST_ID_MAIN")
        BREVO_LIST_ID_PARTNERS = os.getenv("BREVO_LIST_ID_PARTNERS")

        if not BREVO_API_KEY or not BREVO_LIST_ID_MAIN or not BREVO_LIST_ID_PARTNERS:
            raise HTTPException(500, "Brevo non configuré")

        url = "https://api.brevo.com/v3/contacts"

        data = {
            "email": payload.email,
            "attributes": {
                "PRENOM": payload.first_name,
                "NOM": payload.last_name,
                "SOCIETE": payload.company,
            },
            "listIds": [
                int(BREVO_LIST_ID_MAIN),
                int(BREVO_LIST_ID_PARTNERS),
            ],
            "updateEnabled": True,
        }


        headers = {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
        }

        response = requests.post(url, json=data, headers=headers)

        if response.status_code not in (200, 201):
            logger.error(response.text)
            raise HTTPException(400, "Erreur inscription newsletter")

        return NewsletterSubscribeResponse(success=True)

    except HTTPException:
        raise
    except Exception:
        logger.exception("Erreur newsletter subscribe")
        raise HTTPException(500, "Erreur inscription newsletter")
