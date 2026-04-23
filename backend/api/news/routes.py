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
    duplicate_company_visual_for_news,
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
import os

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================

@router.post("/create")
def create_route(data: NewsCreate):
    try:
        news_id = create_news(data)

        return {
            "status": "ok",
            "id_news": news_id,
        }

    except Exception as e:
        logger.exception("Erreur création news")
        raise HTTPException(400, str(e))

# ============================================================
# DUPLICATE COMPANY VISUAL
# ============================================================

@router.post("/visual/duplicate-company")
def duplicate_company_visual_route(payload: dict):
    try:
        id_news = payload.get("id_news")
        company_media_id = payload.get("company_media_id")

        if not id_news or not company_media_id:
            raise HTTPException(400, "Paramètres manquants")

        filename = duplicate_company_visual_for_news(
            id_news=id_news,
            company_media_id=company_media_id,
        )

        return {
            "status": "ok",
            "filename": filename,
        }

    except Exception as e:
        logger.exception("Erreur duplication visuel société")
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
        return {
            "status": "ok",
            "types": types
        }
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
        return {
            "status": "ok",
            "companies": data
        }
    except Exception:
        logger.exception("Erreur liste sociétés public")
        raise HTTPException(400, "Erreur liste sociétés")

# ============================================================
# SEARCH BREVES — FLUX UNIQUEMENT
# ============================================================

@router.get("/breves/search")
def search_breves_route(
    topics: Optional[List[str]] = Query(default=None),
    news_types: Optional[List[str]] = Query(default=None),
    companies: Optional[List[str]] = Query(default=None),
    limit: int = Query(20, ge=1, le=50),
    cursor: Optional[str] = None,
):
    try:
        data = search_breves_public(
            topics=topics,
            news_types=news_types,
            companies=companies,
            limit=limit,
            cursor=cursor,
        )

        return {
            "status": "ok",
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

@router.get("/breves/stats")
def breves_stats_route():
    try:
        data = get_breves_stats_public()
        return {
            "status": "ok",
            **data
        }
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
        "status": "ok",
        "items": items,
        "next_cursor": items[-1]["published_at"] if items else None,
    }

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
    source_type = payload.get("source_type")  # conservé si utile plus tard

    if not source_text or not source_text.strip():
        raise HTTPException(400, "Source manquante")

    prompt = f"""
Tu es l’assistant éditorial de Ratecard, média spécialisé AdTech, Retail Media et transformation marketing.

MISSION :
Transformer une source brute (post, communiqué, interview, article, note interne, transcription, etc.) 
en une news éditoriale factuelle, claire et immédiatement exploitable en français professionnel.

RÈGLES ABSOLUES :
- Strictement basé sur la source fournie.
- Aucun ajout d'information non présente dans la source.
- Aucun chiffre inventé.
- Aucun ton promotionnel ou commercial.
- Pas d’exagération.
- Pas d’opinion.
- Pas de recommandation.
- Ne pas extrapoler au-delà du texte.
- Style sobre, précis et synthétique.
- Français professionnel irréprochable.

OBJECTIF ÉDITORIAL :
- Mettre en évidence le fait principal.
- Clarifier ce qui se passe concrètement.
- Expliciter les éléments de contexte ou enjeux implicites présents dans la source.
- Permettre une compréhension rapide sans relire l’article.
- Produire une lecture utile, pas un résumé narratif.

FORMAT DE SORTIE :
Retourne uniquement un JSON strict valide, sans texte autour, avec :

{{
  "title": "...",
  "excerpt": "...",
  "body_html": "..."
}}

CONTRAINTES :

TITLE
- 70 à 120 caractères
- Informatif et factuel
- Sans point d’exclamation
- Sans superlatif
- Doit refléter le signal principal

EXCERPT
- 3 à 4 phrases
- 300 à 500 caractères
- Ne doit PAS répéter le titre
- Doit contenir :
    1. Le fait principal (qui fait quoi ?)
    2. Le contexte immédiat (marché / produit / positionnement si présent)
    3. L’élément différenciant ou structurant mentionné dans la source
    4. L’implication ou conséquence implicite si identifiable dans le texte
- Chaque phrase doit apporter une information nouvelle
- Aucune phrase générique ou vide
- Aucun adjectif promotionnel
- Ne pas reformuler deux fois la même idée

BODY_HTML
- Liste de 4 à 6 points clés
- Format STRICT :
  <ul>
    <li>...</li>
  </ul>

- Chaque point doit :
    - contenir une seule idée
    - être directement informatif
    - être utile à la compréhension rapide
    - ne pas répéter l’excerpt
    - être basé strictement sur la source

- Interdictions :
    - pas de narration
    - pas de phrases longues
    - pas de paraphrase d’article
    - pas d’interprétation avancée
    - pas de recommandation

SOURCE :
{source_text}
"""

    raw = run_llm(prompt)

    if not raw:
        return {
            "status": "ok",
            "news": {
                "title": "",
                "excerpt": "",
                "body": "",
            },
        }

    try:
        # Extraction stricte du JSON
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("JSON introuvable")

        data = json.loads(match.group(0))

        return {
            "status": "ok",
            "news": {
                "title": (data.get("title") or "").strip(),
                "excerpt": (data.get("excerpt") or "").strip(),
                "body": (data.get("body_html") or "").strip(),
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
        return {
            "status": "ok",
            "deleted": True
        }
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
# LINKEDIN GENERATE (ONE NEWS) — VERSION RATECARD
# ============================================================

@router.post("/{news_id}/linkedin/generate")
def generate_linkedin_post_for_news(news_id: str):
    try:
        news = get_news(news_id)

        if not news:
            raise HTTPException(404, "News introuvable")

        title = news.get("title") or ""
        excerpt = news.get("excerpt") or ""
        company_name = news.get("company", {}).get("name") or ""

        if not title.strip():
            raise HTTPException(400, "Titre manquant")

        site_url = os.getenv("PUBLIC_SITE_URL", "https://ratecard.fr")
        news_url = f"{site_url}/news?news_id={news_id}"

        prompt = f"""
Tu es l’éditeur LinkedIn de Ratecard, en mission pour valoriser une actualité client.

MISSION :
Rédiger un post LinkedIn qui met en valeur l’annonce, tout en conservant une lecture business crédible.

RÈGLES ABSOLUES :
- Strictement basé sur les informations fournies.
- Aucun ajout externe.
- Aucun chiffre inventé.
- Pas de hashtags.
- Pas d’emojis.
- Pas de ton publicitaire ou promotionnel excessif.

OBJECTIF :
Valoriser l’initiative sans surjouer.
Montrer en quoi elle est pertinente, structurante ou révélatrice.

STRUCTURE ATTENDUE :

1) Hook engageant (angle clair, pas une reformulation)
2) Mise en avant de la société et de son initiative
3) Décryptage :
   - ce que fait concrètement la société
   - pourquoi c’est intéressant / pertinent
4) Lecture business :
   - ce que cela apporte (performance, usage, stratégie, différenciation…)
5) Ouverture :
   - ce que cela peut changer ou accélérer
6) Ligne finale obligatoire :
Lire la news complète : {news_url}

STYLE :
- Fluide, crédible, jamais “corporate creux”
- Ton positif mais maîtrisé
- Éviter les superlatifs (“révolutionnaire”, “unique”, etc.)
- Pas de banalités

Longueur cible : 700 à 1 100 caractères.

SOCIÉTÉ :
{company_name}

TITRE :
{title}

EXCERPT :
{excerpt}
"""

        text = run_llm(prompt)

        return {
            "status": "ok",
            "text": text.strip() if text else ""
        }

    except Exception as e:
        logger.exception("Erreur génération LinkedIn")
        raise HTTPException(500, f"Erreur génération LinkedIn : {e}")

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

# ============================================================
# LINKEDIN GET (ONE NEWS)
# ============================================================

@router.get("/{news_id}/linkedin")
def get_linkedin_post_for_news(news_id: str):
    try:
        post = get_news_linkedin_post(news_id)

        if not post:
            return {"status": "ok", "post": None}

        return {"status": "ok", "post": post}

    except Exception:
        logger.exception("Erreur récupération post LinkedIn")
        raise HTTPException(500, "Erreur récupération post LinkedIn")


# ============================================================
# GET ONE NEWS
# ============================================================

@router.get("/{id_news}")
def get_route(id_news: str):
    news = get_news(id_news)
    if not news:
        raise HTTPException(404, "News introuvable")
    return {"status": "ok", "news": news}
