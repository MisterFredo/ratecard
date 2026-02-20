from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

from api.news.models import (
    NewsCreate,
    NewsUpdate,
    NewsLinkedInPost,
    NewsPublish,
    NewsLinkedInPostResponse,
    BrevesSearchResponse,
    BrevesStatsResponse,
)

from core.news.service import (
    create_news,
    list_news,
    list_news_types,
    list_news_admin,
    list_companies_public,
    list_breves_public,
    search_breves_public,
    get_breves_stats_public,
    get_news,
    update_news,
    archive_news,
    publish_news,
    delete_news,
    get_news_admin_stats,
    get_news_linkedin_post,
    save_news_linkedin_post,
)

from utils.llm import run_llm

import logging
import json
import re

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================

@router.post("/create")
def create_route(data: NewsCreate):
    try:
        news_id = create_news(data)
        return {"status": "ok", "id_news": news_id}
    except Exception as e:
        logger.exception("Erreur création news")
        raise HTTPException(400, str(e))


# ============================================================
# LIST NEWS PUBLIC
# ============================================================

@router.get("/list")
def list_route(kind: str | None = None):
    try:
        # Sécurité minimale : on autorise seulement NEWS ou BRIEF
        if kind and kind not in ["NEWS", "BRIEF"]:
            raise HTTPException(400, "Invalid news kind")

        rows = list_news(kind)

        news = [
            {
                **n,
                "COMPANY_MEDIA_LOGO_RECTANGLE_ID": n.get(
                    "MEDIA_LOGO_RECTANGLE_ID"
                )
            }
            for n in rows
        ]

        return {"status": "ok", "news": news}

    except Exception:
        logger.exception("Erreur liste news")
        raise HTTPException(400, "Erreur liste news")


# ============================================================
# LIST ADMIN
# ============================================================

@router.get("/admin/list")
def list_admin_route(
    limit: int = 50,
    offset: int = 0,
    news_type: str | None = None,
    news_kind: str | None = None,
    company: str | None = None,
):
    try:
        rows = list_news_admin(
            limit=limit,
            offset=offset,
            news_type=news_type,
            news_kind=news_kind,
            company=company,
        )
        return {"status": "ok", "news": rows}
    except Exception:
        logger.exception("Erreur liste admin news")
        raise HTTPException(400, "Erreur liste admin news")


# ============================================================
# NEWS TYPES
# ============================================================

@router.get("/types")
def list_news_types_route():
    try:
        types = list_news_types()
        return {"types": types}
    except Exception:
        logger.exception("Erreur chargement NEWS_TYPE")
        raise HTTPException(500, "Erreur chargement catégories éditoriales")

# ============================================================
# LIST ALL COMPANIES — PUBLIC
# ============================================================

@router.get("/companies")
def list_companies_route():
    try:
        data = list_companies_public()
        return {"companies": data}
    except Exception:
        logger.exception("Erreur liste sociétés public")
        raise HTTPException(400, "Erreur liste sociétés")

# ============================================================
# SEARCH BREVES — FLUX UNIQUEMENT
# ============================================================

@router.get("/breves/search", response_model=BrevesSearchResponse)
def search_breves_route(
    topics: Optional[List[str]] = Query(default=None),
    news_types: Optional[List[str]] = Query(default=None),
    companies: Optional[List[str]] = Query(default=None),
    limit: int = Query(20, ge=1, le=50),
    cursor: Optional[str] = None,
):
    try:
        data = search_breves_public(   # ⚠️ version FLUX uniquement
            topics=topics,
            news_types=news_types,
            companies=companies,
            limit=limit,
            cursor=cursor,
        )

        return {
            "total_count": data.get("total_count", 0),
            "sponsorised": data.get("sponsorised", []),
            "items": data.get("items", []),
        }

    except Exception as e:
        logger.exception("Erreur search signaux")
        raise HTTPException(400, str(e))

# ============================================================
# STATS BRÈVES — FILTRES UNIQUEMENT
# ============================================================

@router.get("/breves/stats", response_model=BrevesStatsResponse)
def breves_stats_route():
    try:
        data = get_breves_stats_public()
        return data

    except Exception as e:
        logger.exception("Erreur stats brèves")
        raise HTTPException(400, str(e))




# ============================================================
# LIST BRÈVES LEGACY (SI CONSERVÉ)
# ============================================================

@router.get("/breves")
def list_breves(
    year: int = Query(..., ge=2022, le=2030),
    limit: int = Query(20, ge=1, le=50),
    cursor: Optional[str] = None,
):
    items = list_breves_public(
        year=year,
        limit=limit,
        cursor=cursor,
    )

    return {
        "items": items,
        "next_cursor": items[-1]["published_at"] if items else None,
    }


# ============================================================
# GET ONE NEWS
# ============================================================

@router.get("/{id_news}")
def get_route(id_news: str):
    news = get_news(id_news)
    if not news:
        raise HTTPException(404, "News introuvable")
    return {"status": "ok", "news": news}


# ============================================================
# UPDATE
# ============================================================

@router.put("/update/{id_news}")
def update_route(id_news: str, data: NewsUpdate):
    try:
        update_news(id_news, data)
        return {"status": "ok", "updated": True}
    except Exception as e:
        logger.exception("Erreur mise à jour news")
        raise HTTPException(400, str(e))


# ============================================================
# ARCHIVE
# ============================================================

@router.post("/archive/{id_news}")
def archive_route(id_news: str):
    try:
        archive_news(id_news)
        return {"status": "ok", "archived": True}
    except Exception:
        logger.exception("Erreur archivage news")
        raise HTTPException(400, "Erreur archivage news")


# ============================================================
# PUBLISH
# ============================================================

@router.post("/publish/{id_news}")
def publish_route(id_news: str, data: NewsPublish):
    try:
        status = publish_news(
            id_news=id_news,
            published_at=data.publish_at,
        )
        return {
            "status": "ok",
            "published_status": status,
        }
    except Exception as e:
        logger.exception("Erreur publication news")
        raise HTTPException(400, str(e))


# ============================================================
# IA GENERATE
# ============================================================

@router.post("/ai/generate")
def ai_generate(payload: dict):
    source_text = payload.get("source_text")
    source_type = payload.get("source_type")

    if not source_text or not source_text.strip():
        raise HTTPException(400, "Source manquante")

    prompt = f"""
Tu es l’assistant éditorial de Ratecard.
Objectif : transformer une source brute en news factuelle.
Retourne un JSON strict avec title, excerpt, body_html.
Source:
{source_text}
"""

    raw = run_llm(prompt)

    if not raw:
        return {"status": "ok", "news": {"title": "", "excerpt": "", "body": ""}}

    try:
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("JSON introuvable")

        data = json.loads(match.group(0))

        return {
            "status": "ok",
            "news": {
                "title": data.get("title", "").strip(),
                "excerpt": data.get("excerpt", "").strip(),
                "body": data.get("body_html", "").strip(),
            },
        }

    except Exception:
        logger.exception("Erreur parsing IA")
        raise HTTPException(500, "Erreur parsing IA")


# ============================================================
# DELETE
# ============================================================

@router.delete("/{news_id}")
def delete_news_route(news_id: str):
    try:
        delete_news(news_id)
        return {"status": "ok"}
    except Exception as e:
        logger.exception("Erreur suppression news")
        raise HTTPException(400, f"Erreur suppression news : {e}")


# ============================================================
# ADMIN STATS
# ============================================================

@router.get("/admin/stats")
def news_admin_stats_route():
    try:
        stats = get_news_admin_stats()
        return {"status": "ok", "stats": stats}
    except Exception:
        logger.exception("Erreur stats admin news")
        raise HTTPException(400, "Erreur stats news")

# ============================================================
# LINKEDIN GENERATE (ONE NEWS)
# ============================================================

@router.post("/{news_id}/linkedin/generate")
def generate_linkedin_post_for_news(news_id: str):
    try:
        news = get_news(news_id)

        if not news:
            raise HTTPException(404, "News introuvable")

        title = news.get("TITLE") or ""
        excerpt = news.get("EXCERPT") or ""

        if not title.strip():
            raise HTTPException(400, "Titre manquant")

        site_url = "https://ratecard-frontend.onrender.com"
        news_url = f"{site_url}/news?news_id={news_id}"

        prompt = f"""
Tu rédiges un post LinkedIn structuré et engageant à partir d’une seule actualité.

OBJECTIF :
Créer un post lisible au scroll, factuel, dynamique,
sans ton commercial ni exagération.

RÈGLES ABSOLUES :
- Strictement basé sur le titre et l’excerpt fournis.
- Aucun ajout d'information.
- Aucun chiffre ou fait inventé.
- Pas de hashtags.
- Pas d’emojis.
- Pas de superlatifs creux (ex: "majeur", "ambitieux", "clé", "stratégique" sans justification).
- Paragraphes courts.
- Style direct, clair, orienté signal marché.

STRUCTURE OBLIGATOIRE :

1) Première ligne = phrase courte et forte issue du titre (hook).
2) Une phrase de contexte.
3) 2 à 4 lignes courtes mettant en évidence le signal principal.
4) Une phrase de mise en perspective factuelle (tendance, logique marché).
5) Ligne finale obligatoire :
Lire la news complète : {news_url}

Longueur cible : 600 à 1 000 caractères.

Titre :
{title}

Excerpt :
{excerpt}
"""

        text = run_llm(prompt)

        return {"text": text.strip() if text else ""}

    except Exception as e:
        logger.exception("Erreur génération LinkedIn")
        raise HTTPException(500, f"Erreur génération LinkedIn : {e}")

# ============================================================
# LINKEDIN GET
# ============================================================

@router.get("/{news_id}/linkedin", response_model=NewsLinkedInPostResponse)
def get_linkedin_post_for_news(news_id: str):
    try:
        post = get_news_linkedin_post(news_id)

        if not post:
            return NewsLinkedInPostResponse()

        return NewsLinkedInPostResponse(
            text=post.get("TEXT"),
            mode=post.get("MODE"),
        )

    except Exception:
        logger.exception("Erreur récupération post LinkedIn")
        raise HTTPException(500, "Erreur récupération post LinkedIn")


# ============================================================
# LINKEDIN SAVE
# ============================================================

@router.post("/{news_id}/linkedin")
def save_linkedin_post_for_news(news_id: str, data: NewsLinkedInPost):
    try:
        save_news_linkedin_post(
            news_id=news_id,
            text=data.text,
            mode=data.mode,
        )
        return {"status": "ok"}
    except Exception:
        logger.exception("Erreur sauvegarde post LinkedIn")
        raise HTTPException(500, "Erreur sauvegarde post LinkedIn")
