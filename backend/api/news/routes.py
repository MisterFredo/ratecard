from fastapi import APIRouter, HTTPException
from api.news.models import (
    NewsCreate,
    NewsUpdate,
    NewsLinkedInPost,
    NewsPublish,
    NewsLinkedInPostResponse,
)
from core.news.service import (
    create_news,
    list_news,
    get_news,
    update_news,
    archive_news,
    publish_news,
    delete_news,
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
    """
    Création d'une NEWS ou d'une BRÈVE.
    La différence est portée par :
    - data.news_type = valeur métier optionnelle
    """
    try:
        news_id = create_news(data)
        return {"status": "ok", "id_news": news_id}
    except Exception as e:
        logger.exception("Erreur création news")
        raise HTTPException(400, str(e))


# ============================================================
# LIST NEWS (ENRICHIE — VISUEL SOCIÉTÉ)
# ============================================================

@router.get("/list")
def list_route():
    try:
        rows = list_news()

        news = [
            {
                **n,
                # fallback visuel société côté front
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

@router.get("/types")
def list_news_types_route():
    try:
        types = list_news_types()
        return {"types": types}

    except Exception as e:
        logger.exception("Erreur chargement NEWS_TYPE")
        raise HTTPException(500, "Erreur chargement catégories éditoriales")


# ============================================================
# GET ONE NEWS / BRÈVE
# ============================================================

@router.get("/{id_news}")
def get_route(id_news: str):
    news = get_news(id_news)
    if not news:
        raise HTTPException(404, "News introuvable")
    return {"status": "ok", "news": news}


# ============================================================
# UPDATE NEWS / BRÈVE
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
# ARCHIVE NEWS
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
# PUBLISH NEWS / BRÈVE
# ============================================================

@router.post("/publish/{id_news}")
def publish_route(
    id_news: str,
    data: NewsPublish,
):
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
# IA — GENERATE NEWS (SOURCE → NEWS / BRÈVE)
# ============================================================

@router.post("/ai/generate")
def ai_generate(payload: dict):
    source_text = payload.get("source_text")
    source_type = payload.get("source_type")

    if not source_text or not source_text.strip():
        raise HTTPException(400, "Source manquante")

    prompt = f"""
Tu es l’assistant éditorial de Ratecard.

OBJECTIF
Transformer une source brute en NEWS PARTENAIRE.

RÈGLES ÉDITORIALES
- Ton neutre, factuel, professionnel
- PAS d’analyse
- PAS d’opinion
- PAS de jargon marketing
- PAS de superlatifs
- Style journalistique sobre

FORMAT DE SORTIE (OBLIGATOIRE)
Retourne un objet JSON avec EXACTEMENT les clés suivantes :

{{
  "title": "Titre factuel et informatif",
  "excerpt": "Synthèse courte (2–3 phrases, ~300 caractères)",
  "body_html": "<p>Corps de la news en HTML.</p>"
}}

RÈGLES HTML POUR body_html
- <p> pour chaque paragraphe
- <ul><li> si pertinent
- <strong> avec parcimonie
- <h2> max 1 si nécessaire
- PAS de styles inline
- PAS de <h1>

SOURCE ({source_type or "texte libre"}):
{source_text}
"""

    raw = run_llm(prompt)

    if not raw:
        return {
            "status": "ok",
            "news": {"title": "", "excerpt": "", "body": ""}
        }

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
# DELETE NEWS
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
# LINKEDIN — GET POST FOR NEWS
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
# LINKEDIN — SAVE / UPDATE POST FOR NEWS
# ============================================================

@router.post("/{news_id}/linkedin")
def save_linkedin_post_for_news(
    news_id: str,
    data: NewsLinkedInPost,
):
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
