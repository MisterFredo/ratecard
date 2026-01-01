# backend/api/visuals/article.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
import requests
from io import BytesIO
from PIL import Image

from openai import OpenAI
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file

router = APIRouter()

BQ_TABLE_ARTICLE = "adex-5555.RATECARD.RATECARD_ARTICLE"


# ============================================================
# MODELS
# ============================================================

class ArticleVisualUpload(BaseModel):
    id_article: str
    filename: str         # ARTICLE_<id>_square.jpg ou _rect.jpg
    base64_image: str     # image transformée côté front


class ArticleApplyExisting(BaseModel):
    id_article: str
    square_url: str | None = None
    rectangle_url: str | None = None


class ArticleVisualReset(BaseModel):
    id_article: str


class ArticleAIGenerate(BaseModel):
    id_article: str
    title: str
    excerpt: str
    axe_visual_square_url: str | None = None
    company_visual_square_url: str | None = None


# ============================================================
# HELPERS
# ============================================================

def create_rectangle(img_bytes: bytes) -> bytes:
    """Transforme en 1200x900 JPEG via Pillow."""
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    img = img.resize((1200, 900))
    out = BytesIO()
    img.save(out, format="JPEG", quality=90)
    return out.getvalue()


def create_square(img_bytes: bytes) -> bytes:
    """Transforme en 600x600 JPEG via Pillow."""
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    img = img.resize((600, 600))
    out = BytesIO()
    img.save(out, format="JPEG", quality=90)
    return out.getvalue()


# ============================================================
# 1️⃣ UPLOAD MANUEL ARTICLE (square OU rectangle)
# ============================================================
@router.post("/upload")
async def upload_article_visual(payload: ArticleVisualUpload):
    try:
        id_article = payload.id_article
        filename = payload.filename.lower().strip()

        if "square" not in filename and "rect" not in filename:
            raise HTTPException(400, "Filename doit contenir square ou rect")

        try:
            img_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Upload GCS final
        url = upload_bytes("articles", filename, img_bytes)

        # Détection colonne BQ
        column = "MEDIA_SQUARE_ID" if "square" in filename else "MEDIA_RECTANGLE_ID"

        # Update BQ
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_ARTICLE}`
            SET {column} = @fname,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_article),
                ]
            )
        ).result()

        return {"status": "ok", "url": url}

    except Exception as e:
        raise HTTPException(400, f"Erreur upload article : {e}")


# ============================================================
# 2️⃣ APPLIQUER VISUEL EXISTANT (CLONE)
# ============================================================
@router.post("/apply-existing")
async def apply_existing_article(payload: ArticleApplyExisting):
    try:
        id_article = payload.id_article
        client = get_bigquery_client()
        results = {}

        pairs = [
            ("square", payload.square_url),
            ("rect", payload.rectangle_url),
        ]

        for fmt, src_url in pairs:
            if not src_url:
                continue

            # Télécharger source
            try:
                img_bytes = requests.get(src_url).content
            except Exception:
                raise HTTPException(400, f"Impossible de télécharger {src_url}")

            filename = f"ARTICLE_{id_article}_{fmt}.jpg"

            # Upload GCS
            url = upload_bytes("articles", filename, img_bytes)

            # Update BQ
            column = "MEDIA_SQUARE_ID" if fmt == "square" else "MEDIA_RECTANGLE_ID"

            sql = f"""
                UPDATE `{BQ_TABLE_ARTICLE}`
                SET {column} = @fname,
                    UPDATED_AT = @now
                WHERE ID_ARTICLE = @id
            """

            client.query(
                sql,
                job_config=bigquery.QueryJobConfig(
                    query_parameters=[
                        bigquery.ScalarQueryParameter("fname", "STRING", filename),
                        bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                        bigquery.ScalarQueryParameter("id", "STRING", id_article),
                    ]
                )
            ).result()

            results[fmt] = url

        return {"status": "ok", "urls": results}

    except Exception as e:
        raise HTTPException(400, f"Erreur apply-existing article : {e}")


# ============================================================
# 3️⃣ RESET VISUELS ARTICLE
# ============================================================
@router.post("/reset")
async def reset_article_visual(payload: ArticleVisualReset):
    try:
        id_article = payload.id_article
        client = get_bigquery_client()

        # Charger anciens noms de fichiers
        q = client.query(
            f"""
            SELECT MEDIA_SQUARE_ID, MEDIA_RECTANGLE_ID
            FROM `{BQ_TABLE_ARTICLE}`
            WHERE ID_ARTICLE = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
            )
        )

        rows = list(q.result())
        old_square = rows[0]["MEDIA_SQUARE_ID"] if rows else None
        old_rect = rows[0]["MEDIA_RECTANGLE_ID"] if rows else None

        # Supprimer GCS
        if old_square:
            delete_file("articles", old_square)
        if old_rect:
            delete_file("articles", old_rect)

        # RESET BQ
        sql = f"""
            UPDATE `{BQ_TABLE_ARTICLE}`
            SET MEDIA_SQUARE_ID = NULL,
                MEDIA_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_article),
                ]
            )
        ).result()

        return {"status": "ok", "reset": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset article : {e}")


# ============================================================
# 4️⃣ GÉNÉRATION IA VISUEL ARTICLE (Carré + Rectangle)
# ============================================================
@router.post("/generate-ai")
async def generate_ai_visual(payload: ArticleAIGenerate):
    """
    Génère un visuel IA 1024x1024 puis :
    - transforme en carré 600x600
    - transforme en rectangle 1200x900
    - upload GCS
    - update BQ
    """

    try:
        client_ai = OpenAI()

        inspiration = (
            payload.axe_visual_square_url
            or payload.company_visual_square_url
            or None
        )

        prompt = f"""
Tu es l’illustrateur officiel Ratecard.
Crée une image moderne, tech, simple & propre.

Titre : "{payload.title}"
Résumé : "{payload.excerpt}"

Si un visuel d’inspiration est fourni, respecte son style.
"""

        img_generation = client_ai.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024",
            response_format="b64_json",
        )

        b64_image = img_generation.data[0].b64_json
        ai_bytes = base64.b64decode(b64_image)

        # Transformations
        square_bytes = create_square(ai_bytes)
        rect_bytes = create_rectangle(ai_bytes)

        # Filenames
        square_name = f"ARTICLE_{payload.id_article}_AI_square.jpg"
        rect_name = f"ARTICLE_{payload.id_article}_AI_rect.jpg"

        # Upload GCS
        square_url = upload_bytes("articles", square_name, square_bytes)
        rect_url = upload_bytes("articles", rect_name, rect_bytes)

        # Update BQ
        client_bq = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_ARTICLE}`
            SET MEDIA_SQUARE_ID = @square,
                MEDIA_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
        """

        client_bq.query(
            sql,
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
            "urls": {
                "square": square_url,
                "rectangle": rect_url,
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur generate-ai article : {e}")

