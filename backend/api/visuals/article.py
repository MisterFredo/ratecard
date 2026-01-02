from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image

from openai import OpenAI
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
GCS_FOLDER = "articles"


# ============================================================
# MODELS
# ============================================================

class ArticleVisualUpload(BaseModel):
    id_article: str
    format: str              # "square" | "rectangle"
    base64_image: str        # image encodée côté front


class ArticleVisualReset(BaseModel):
    id_article: str


class ArticleAIGenerate(BaseModel):
    id_article: str
    title: str
    excerpt: str
    topics: list[str]        # labels des topics


# ============================================================
# HELPERS — TRANSFORMATIONS
# ============================================================

def to_square(img_bytes: bytes) -> bytes:
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    img = img.resize((600, 600))
    out = BytesIO()
    img.save(out, format="JPEG", quality=90)
    return out.getvalue()


def to_rectangle(img_bytes: bytes) -> bytes:
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    img = img.resize((1200, 900))
    out = BytesIO()
    img.save(out, format="JPEG", quality=90)
    return out.getvalue()


# ============================================================
# 1️⃣ UPLOAD MANUEL VISUEL ARTICLE
# ============================================================
@router.post("/upload")
def upload_article_visual(payload: ArticleVisualUpload):
    try:
        if payload.format not in ("square", "rectangle"):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "invalid_format",
                    "message": "Format invalide (square ou rectangle attendu)"
                }
            )

        img_bytes = base64.b64decode(payload.base64_image)

        suffix = "square" if payload.format == "square" else "rect"
        filename = f"ARTICLE_{payload.id_article}_{suffix}.jpg"

        # Upload GCS
        upload_bytes(GCS_FOLDER, filename, img_bytes)

        column = (
            "MEDIA_SQUARE_ID"
            if payload.format == "square"
            else "MEDIA_RECTANGLE_ID"
        )

        client = get_bigquery_client()
        client.query(
            f"""
            UPDATE `{TABLE_ARTICLE}`
            SET {column} = @fname,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_article),
                ]
            )
        ).result()

        return {"status": "ok", "filename": filename}

    except Exception as e:
        print("❌ UPLOAD ARTICLE VISUAL ERROR:", str(e))
        raise HTTPException(
            status_code=400,
            detail={
                "error": "article_visual_upload_failed",
                "message": str(e),
            }
        )


# ============================================================
# 2️⃣ RESET VISUEL ARTICLE (remplacement total)
# ============================================================
@router.post("/reset")
def reset_article_visual(payload: ArticleVisualReset):
    try:
        client = get_bigquery_client()

        client.query(
            f"""
            UPDATE `{TABLE_ARTICLE}`
            SET
                MEDIA_SQUARE_ID = NULL,
                MEDIA_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_article),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        print("❌ RESET ARTICLE VISUAL ERROR:", str(e))
        raise HTTPException(
            status_code=400,
            detail={
                "error": "article_visual_reset_failed",
                "message": str(e),
            }
        )


# ============================================================
# 3️⃣ GÉNÉRATION IA VISUEL ARTICLE
# ============================================================
@router.post("/generate-ai")
def generate_ai_visual(payload: ArticleAIGenerate):
    """
    Génère un visuel IA pour l’article.
    Inspiration : topics + title + excerpt
    """
    try:
        # ----------------------------------------------------
        # GUARDS MÉTIER (OBLIGATOIRES)
        # ----------------------------------------------------
        if not payload.title.strip():
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "missing_title",
                    "message": "Le titre est requis pour générer un visuel IA",
                }
            )

        if not payload.excerpt.strip():
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "missing_excerpt",
                    "message": "L’accroche (excerpt) est requise pour générer un visuel IA",
                }
            )

        if not payload.topics or len(payload.topics) == 0:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "missing_topics",
                    "message": "Au moins un topic est requis pour générer un visuel IA",
                }
            )

        print("🧠 AI VISUAL PAYLOAD:", payload)

        client_ai = OpenAI()

        topics_text = ", ".join(payload.topics)

        prompt = f"""
Tu es l’illustrateur officiel Ratecard.
Crée une image moderne, sobre et professionnelle.

Titre de l’article :
"{payload.title}"

Accroche :
"{payload.excerpt}"

Thèmes éditoriaux :
{topics_text}

Contraintes graphiques :
- ligne claire
- fond clair
- bleu Ratecard (#10323d)
- aucun texte lisible dans l’image
"""

        result = client_ai.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024",
            response_format="b64_json",
        )

        base = base64.b64decode(result.data[0].b64_json)

        square_bytes = to_square(base)
        rect_bytes = to_rectangle(base)

        square_name = f"ARTICLE_{payload.id_article}_AI_square.jpg"
        rect_name = f"ARTICLE_{payload.id_article}_AI_rect.jpg"

        upload_bytes(GCS_FOLDER, square_name, square_bytes)
        upload_bytes(GCS_FOLDER, rect_name, rect_bytes)

        client_bq = get_bigquery_client()
        client_bq.query(
            f"""
            UPDATE `{TABLE_ARTICLE}`
            SET
                MEDIA_SQUARE_ID = @square,
                MEDIA_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_article),
                ]
            )
        ).result()

        return {
            "status": "ok",
            "filenames": {
                "square": square_name,
                "rectangle": rect_name,
            }
        }

    except HTTPException:
        # déjà structuré
        raise

    except Exception as e:
        print("❌ IA VISUAL ERROR:", str(e))
        raise HTTPException(
            status_code=400,
            detail={
                "error": "ai_visual_generation_failed",
                "message": str(e),
            }
        )
