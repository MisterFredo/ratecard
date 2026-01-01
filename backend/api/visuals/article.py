from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4
import base64
from google.cloud import bigquery

from utils.gcs_service import upload_image_buffer
from utils.bigquery_utils import get_bigquery_client

router = APIRouter()

BQ_TABLE_ARTICLE = "adex-5555.RATECARD.RATECARD_ARTICLE"


# -------------------------------------------------------------------
# Payload générique pour upload manuel
# -------------------------------------------------------------------
class ArticleVisualUpload(BaseModel):
    id_article: str
    title: str
    base64_image: str  # image d'origine en base64


# -------------------------------------------------------------------
# Payload pour appliquer un visuel existant (axe / company)
# -------------------------------------------------------------------
class ArticleApplyExisting(BaseModel):
    id_article: str
    rectangle_url: str
    square_url: str


# ================================================================
# 1️⃣ UPLOAD MANUEL POUR ARTICLE
# ================================================================
@router.post("/upload")
async def upload_article_visual(payload: ArticleVisualUpload):
    """
    Upload manuel d’un visuel article :
    - Réception base64
    - Génération rectangle + square
    - Upload GCS
    - Mise à jour BQ
    """

    try:
        id_article = payload.id_article
        title = payload.title.strip()

        if not title:
            raise HTTPException(400, "Titre manquant")

        # Décodage du base64
        try:
            img_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        safe_title = title.replace(" ", "_")
        filename_base = f"ARTICLE_{id_article}_{safe_title}"

        # --- Génération formats ---
        import sharp  # sera remplacé par util interne pour compat DX

        rectangle = sharp(img_bytes).resize(1200, 900).jpeg().to_buffer()
        square = sharp(img_bytes).resize(600, 600).jpeg().to_buffer()

        # --- Upload GCS ---
        rect_name = f"{filename_base}_rect.jpg"
        square_name = f"{filename_base}_square.jpg"

        rect_url = upload_image_buffer("articles", rect_name, rectangle)
        square_url = upload_image_buffer("articles", square_name, square)

        # --- Mise à jour BQ ---
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_ARTICLE}`
            SET MEDIA_RECTANGLE_ID = @rect,
                MEDIA_SQUARE_ID = @square,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_article),
                ]
            ),
        ).result()

        return {
            "status": "ok",
            "urls": {
                "rectangle": rect_url,
                "square": square_url,
            },
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur upload visuel article : {e}")


# ================================================================
# 2️⃣ APPLIQUER UN VISUEL EXISTANT (AXE / ENTREPRISE)
# ================================================================
@router.post("/apply-existing")
async def apply_existing_visual(payload: ArticleApplyExisting):
    """
    Applique un visuel déjà existant :
    - Télécharge rectangle & square existants
    - Les réuploade pour être dédiés à l’article
    - Met à jour BQ
    """

    try:
        import requests

        id_article = payload.id_article

        # Télécharger les deux formats existants
        rect_bytes = requests.get(payload.rectangle_url).content
        square_bytes = requests.get(payload.square_url).content

        filename_base = f"ARTICLE_{id_article}_FROM_EXISTING"

        rect_name = f"{filename_base}_rect.jpg"
        square_name = f"{filename_base}_square.jpg"

        rect_url = upload_image_buffer("articles", rect_name, rect_bytes)
        square_url = upload_image_buffer("articles", square_name, square_bytes)

        # Update BQ
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_ARTICLE}`
            SET MEDIA_RECTANGLE_ID = @rect,
                MEDIA_SQUARE_ID = @square,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_article),
                ]
            ),
        ).result()

        return {
            "status": "ok",
            "urls": {
                "rectangle": rect_url,
                "square": square_url,
            },
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur apply-existing : {e}")


# ================================================================
# 3️⃣ GÉNÉRATION IA DU VISUEL ARTICLE
# ================================================================
class ArticleAIGenerate(BaseModel):
    id_article: str
    title: str
    excerpt: str
    axe_visual_square_url: str | None = None  # visuel axe (inspiration IA)
    company_visual_square_url: str | None = None


@router.post("/generate-ai")
async def generate_ai_visual(payload: ArticleAIGenerate):
    """
    Génère un visuel IA :
    - Utilise l’axe si dispo
    - Sinon la société
    - Sinon texte seul
    - Upload GCS
    - Mise à jour BigQuery
    """

    try:
        from openai import OpenAI

        client = OpenAI()

        inspiration_url = (
            payload.axe_visual_square_url
            or payload.company_visual_square_url
        )

        inspiration_bytes = None

        if inspiration_url:
            import requests
            inspiration_bytes = requests.get(inspiration_url).content

        prompt = f"""
        Tu es un illustrateur Ratecard :
        - ligne claire, tech, propre
        - style cohérent avec nos visuels GCS

        Inspire-toi de ce visuel si fourni.
        Titre : {payload.title}
        Résumé : {payload.excerpt}
        """

        # Génération IA → image base64
        ai_img = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024",
            response_format="b64_json",
        )

        b64_image = ai_img.data[0].b64_json
        img_bytes = base64.b64decode(b64_image)

        # Transformation formats
        import sharp
        rect = sharp(img_bytes).resize(1200, 900).jpeg().to_buffer()
        square = sharp(img_bytes).resize(600, 600).jpeg().to_buffer()

        filename_base = f"ARTICLE_{payload.id_article}_AI"

        rect_name = f"{filename_base}_rect.jpg"
        square_name = f"{filename_base}_square.jpg"

        rect_url = upload_image_buffer("articles", rect_name, rect)
        square_url = upload_image_buffer("articles", square_name, square)

        # Update BQ
        client_bq = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_ARTICLE}`
            SET MEDIA_RECTANGLE_ID = @rect,
                MEDIA_SQUARE_ID = @square,
                UPDATED_AT = @now
            WHERE ID_ARTICLE = @id
        """

        client_bq.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_article),
                ]
            ),
        ).result()

        return {
            "status": "ok",
            "urls": {
                "rectangle": rect_url,
                "square": square_url,
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur generate-ai : {e}")
