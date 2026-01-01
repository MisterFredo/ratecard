from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4
import base64
import sharp  # ⚠️ sera remplacé par notre service interne dans utils (voir étape 5)
from utils.gcs_service import upload_image_buffer
from utils.bigquery_utils import get_bigquery_client

router = APIRouter()

BQ_TABLE_AXE = "adex-5555.RATECARD.RATECARD_AXE"


# -------------------------------------------------------------------
# Payload reçu depuis le front
# -------------------------------------------------------------------
class AxeVisualUpload(BaseModel):
    id_axe: str
    title: str
    base64_image: str  # image d'origine envoyée par le front en base64


# -------------------------------------------------------------------
# MAIN ENDPOINT
# -------------------------------------------------------------------
@router.post("/upload")
async def upload_axe_visual(payload: AxeVisualUpload):
    """
    Upload d’un visuel pour un axe.
    - Génère rectangle + square
    - Upload dans GCS
    - Met à jour directement RATECARD_AXE (pas d’assign)
    """

    try:
        id_axe = payload.id_axe
        title = payload.title.strip()

        if not title:
            raise HTTPException(400, "Titre manquant")

        # Décodage base64 → buffer
        try:
            img_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Normalisation nom
        safe_title = title.replace(" ", "_").replace("/", "_")
        filename_base = f"AXE_{safe_title}"

        # -------------------------------------------------------------------
        # Génération formats
        # -------------------------------------------------------------------
        # NOTE : Dans la version finale, nous utiliserons sharp côté Next.js,
        # ici on garde le principe. Le module sera factorisé dans utils.
        rectangle = sharp(img_bytes).resize(1200, 900).jpeg().to_buffer()
        square = sharp(img_bytes).resize(600, 600).jpeg().to_buffer()

        # -------------------------------------------------------------------
        # Upload GCS
        # -------------------------------------------------------------------
        rect_name = f"{filename_base}_rect.jpg"
        square_name = f"{filename_base}_square.jpg"

        rect_url = upload_image_buffer("axes", rect_name, rectangle)
        square_url = upload_image_buffer("axes", square_name, square)

        # -------------------------------------------------------------------
        # Enregistrement dans BigQuery (mise à jour axe)
        # -------------------------------------------------------------------
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_AXE}`
            SET MEDIA_RECTANGLE_ID = @rect,
                MEDIA_SQUARE_ID = @square,
                UPDATED_AT = @now
            WHERE ID_AXE = @id
        """

        job = client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_axe),
                ]
            )
        )
        job.result()

        return {
            "status": "ok",
            "urls": {
                "rectangle": rect_url,
                "square": square_url,
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur upload visuel axe : {e}")
