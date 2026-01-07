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

router = APIRouter()


# ============================================================
# CREATE NEWS
# ============================================================
@router.post("/create")
def create_route(data: NewsCreate):
    try:
        news_id = create_news(data)
        return {"status": "ok", "id_news": news_id}
    except Exception as e:
        raise HTTPException(400, f"Erreur création news : {e}")


# ============================================================
# LIST NEWS (ADMIN)
# ============================================================
@router.get("/list")
def list_route():
    try:
        news = list_news()
        return {"status": "ok", "news": news}
    except Exception as e:
        raise HTTPException(400, f"Erreur liste news : {e}")


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
# AIDE IA
# ============================================================
@router.post("/ai/from-source")
def ai_from_source(payload: dict):
    """
    Transforme une source (texte ou URL) en brouillon de News.
    """
    try:
        return {
            "status": "ok",
            "news": generate_news_from_source(
                source_type=payload.get("source_type"),
                source_text=payload.get("source_text"),
            )
        }
    except Exception as e:
        raise HTTPException(400, f"Erreur IA News : {e}")



# ============================================================
# UPDATE NEWS
# ============================================================
@router.put("/update/{id_news}")
def update_route(id_news: str, data: NewsUpdate):
    try:
        update_news(id_news, data)
        return {"status": "ok", "updated": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour news : {e}")


# ============================================================
# ARCHIVE NEWS
# ============================================================
@router.post("/archive/{id_news}")
def archive_route(id_news: str):
    try:
        archive_news(id_news)
        return {"status": "ok", "archived": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur archivage news : {e}")


# ============================================================
# PUBLISH NEWS
# ============================================================
@router.post("/publish/{id_news}")
def publish_route(id_news: str, published_at: str | None = None):
    try:
        status = publish_news(id_news, published_at)
        return {"status": "ok", "published_status": status}
    except Exception as e:
        raise HTTPException(400, f"Erreur publication news : {e}")
