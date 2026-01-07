from fastapi import APIRouter, HTTPException
from api.news.models import NewsCreate, NewsUpdate
from core.news.service import (
    create_news,
    list_news,
    get_news,
    update_news,
    archive_news,
    publish_news,
)
from utils.llm import run_llm

router = APIRouter()


# ============================================================
# CREATE NEWS
# ============================================================
@router.post("/create")
def create_route(data: NewsCreate):
    try:
        news_id = create_news(data)
        return {"status": "ok", "id_news": news_id}
    except Exception:
        raise HTTPException(400, "Erreur création news")


# ============================================================
# LIST NEWS
# ============================================================
@router.get("/list")
def list_route():
    try:
        return {"status": "ok", "news": list_news()}
    except Exception:
        raise HTTPException(400, "Erreur liste news")


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
# UPDATE NEWS
# ============================================================
@router.put("/update/{id_news}")
def update_route(id_news: str, data: NewsUpdate):
    try:
        update_news(id_news, data)
        return {"status": "ok", "updated": True}
    except Exception:
        raise HTTPException(400, "Erreur mise à jour news")


# ============================================================
# ARCHIVE NEWS
# ============================================================
@router.post("/archive/{id_news}")
def archive_route(id_news: str):
    try:
        archive_news(id_news)
        return {"status": "ok", "archived": True}
    except Exception:
        raise HTTPException(400, "Erreur archivage news")


# ============================================================
# PUBLISH NEWS
# ============================================================
@router.post("/publish/{id_news}")
def publish_route(id_news: str, published_at: str | None = None):
    try:
        status = publish_news(id_news, published_at)
        return {"status": "ok", "published_status": status}
    except Exception:
        raise HTTPException(400, "Erreur publication news")


# ============================================================
# IA — GENERATE NEWS (SOURCE → NEWS)
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
Transformer une source brute en NEWS PARTENAIRE d'environ 200 mots.

RÈGLES
- Ton neutre, factuel, professionnel
- PAS d’analyse
- PAS d’opinion
- PAS de jargon marketing
- PAS de superlatifs

FORMAT STRICT
TITRE:
...

TEXTE:
...

SOURCE ({source_type or "texte libre"}):
{source_text}
"""

    raw = run_llm(prompt)

    title = ""
    body = ""

    if raw:
        lines = raw.splitlines()
        current = None
        buffer = []

        for line in lines:
            line = line.strip()
            if line.upper().startswith("TITRE"):
                current = "title"
                buffer = []
            elif line.upper().startswith("TEXTE"):
                if current == "title":
                    title = " ".join(buffer).strip()
                current = "body"
                buffer = []
            else:
                buffer.append(line)

        if current == "body":
            body = " ".join(buffer).strip()

    return {
        "status": "ok",
        "news": {
            "title": title,
            "body": body,
        },
    }
