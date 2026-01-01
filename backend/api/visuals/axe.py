from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64

from google.cloud import bigquery
from utils.bigquery_utils import get_bigquery_client
from utils.gcs_service import upload_image_buffer

router = APIRouter()

BQ_TABLE_AXE = "adex-5555.RATECARD.RATECARD_AXE"


# -------------------------------------------------------------------
# Payload upload manuel
# -------------------------------------------------------------------
class AxeVisualUpload(BaseModel):
    id_axe: str
    base64_image: str   # image brute
    generate_rectangle: bool = True  # par défaut on génère rect + carré


# -------------------------------------------------------------------
# Upload visuel axe (manuel)
# -------------------------------------------------------------------
@router.post("/upload")
async def upload_axe_visual(payload: AxeVisualUpload):
    """
    Upload d’un visuel pour un axe éditorial.
    - carré (600×600)
    - rectangle (1200×900)
    Les deux sont toujours générés.
    """

    try:
        id_axe = payload.id_axe

        try:
            raw_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Transformation via sharp-like
        import sharp

        square_bytes = sharp(raw_bytes).resize(600, 600).jpeg().to_buffer()

        rect_bytes = sharp(raw_bytes).resize(1200, 900).jpeg().to_buffer()

        square_name = f"AXE_{id_axe}_square.jpg"
        rect_name = f"AXE_{id_axe}_rect.jpg"

        # Upload to GCS
        square_url = upload_image_buffer("axes", square_name, square_bytes)
        rect_url = upload_image_buffer("axes", rect_name, rect_bytes)

        # Update BQ
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_AXE}`
            SET MEDIA_SQUARE_ID = @square,
                MEDIA_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_AXE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_axe),
                ]
            )
        ).result()

        return {
            "status": "ok",
            "urls": {
                "square": square_url,
                "rectangle": rect_url
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur upload visuel axe : {e}")


# -------------------------------------------------------------------
# Application d’un visuel existant (ex : société, article…)
# -------------------------------------------------------------------
class AxeApplyExisting(BaseModel):
    id_axe: str
    square_url: str
    rectangle_url: str


@router.post("/apply-existing")
async def apply_existing_axe(payload: AxeApplyExisting):
    """
    Applique des visuels existants en les téléchargeant et en les
    ré-uploade dans GCS sous la forme dédiée à l’axe.
    """

    try:
        import requests

        id_axe = payload.id_axe

        # Télécharger depuis URLs existantes
        square_bytes = requests.get(payload.square_url).content
        rect_bytes = requests.get(payload.rectangle_url).content

        # Filenames dédiés
        square_name = f"AXE_{id_axe}_square.jpg"
        rect_name = f"AXE_{id_axe}_rect.jpg"

        square_url = upload_image_buffer("axes", square_name, square_bytes)
        rect_url = upload_image_buffer("axes", rect_name, rect_bytes)

        # Update BQ
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_AXE}`
            SET MEDIA_SQUARE_ID = @square,
                MEDIA_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_AXE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_axe),
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
        raise HTTPException(400, f"Erreur apply-existing axe : {e}")


# -------------------------------------------------------------------
# Reset visuels axe
# -------------------------------------------------------------------
class AxeVisualReset(BaseModel):
    id_axe: str


@router.post("/reset")
async def reset_axe_visual(payload: AxeVisualReset):
    """
    Supprime les références visuelles de l’axe sans supprimer les fichiers GCS.
    """

    try:
        id_axe = payload.id_axe

        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_AXE}`
            SET MEDIA_SQUARE_ID = NULL,
                MEDIA_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_AXE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_axe),
                ]
            )
        ).result()

        return {"status": "ok", "reset": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset axe : {e}"}
