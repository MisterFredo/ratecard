from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
import requests
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs_service import upload_image_buffer

router = APIRouter()

BQ_TABLE_COMPANY = "adex-5555.RATECARD.RATECARD_COMPANY"


# --------------------------------------------------------------------
# MODELS
# --------------------------------------------------------------------

class CompanyVisualUpload(BaseModel):
    id_company: str
    base64_image: str


class CompanyApplyExisting(BaseModel):
    id_company: str
    square_url: str
    rectangle_url: str


class CompanyVisualReset(BaseModel):
    id_company: str


# --------------------------------------------------------------------
# UPLOAD & TRANSFORM
# --------------------------------------------------------------------
@router.post("/upload")
async def upload_company_visual(payload: CompanyVisualUpload):
    """
    Upload d’un visuel société → génération carré + rectangulaire.
    """
    try:
        id_company = payload.id_company

        # Decode base64
        try:
            raw_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        import sharp

        square_bytes = sharp(raw_bytes).resize(600, 600).jpeg().to_buffer()
        rect_bytes = sharp(raw_bytes).resize(1200, 900).jpeg().to_buffer()

        square_name = f"COMPANY_{id_company}_square.jpg"
        rect_name = f"COMPANY_{id_company}_rect.jpg"

        square_url = upload_image_buffer("companies", square_name, square_bytes)
        rect_url = upload_image_buffer("companies", rect_name, rect_bytes)

        # BQ update
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_COMPANY}`
            SET MEDIA_LOGO_SQUARE_ID = @square,
                MEDIA_LOGO_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_company),
                ]
            )
        ).result()

        return {
            "status": "ok",
            "urls": {"square": square_url, "rectangle": rect_url},
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur upload société : {e}")


# --------------------------------------------------------------------
# APPLY EXISTING (clone depuis n’importe quelle URL)
# --------------------------------------------------------------------
@router.post("/apply-existing")
async def apply_existing_company(payload: CompanyApplyExisting):
    try:
        id_company = payload.id_company

        square_bytes = requests.get(payload.square_url).content
        rect_bytes = requests.get(payload.rectangle_url).content

        square_name = f"COMPANY_{id_company}_square.jpg"
        rect_name = f"COMPANY_{id_company}_rect.jpg"

        square_url = upload_image_buffer("companies", square_name, square_bytes)
        rect_url = upload_image_buffer("companies", rect_name, rect_bytes)

        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_COMPANY}`
            SET MEDIA_LOGO_SQUARE_ID = @square,
                MEDIA_LOGO_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_company),
                ]
            )
        ).result()

        return {
            "status": "ok",
            "urls": {"square": square_url, "rectangle": rect_url},
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur apply-existing société : {e}")


# --------------------------------------------------------------------
# RESET
# --------------------------------------------------------------------
@router.post("/reset")
async def reset_company_visual(payload: CompanyVisualReset):
    try:
        id_company = payload.id_company

        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_COMPANY}`
            SET MEDIA_LOGO_SQUARE_ID = NULL,
                MEDIA_LOGO_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_company),
                ]
            )
        ).result()

        return {"status": "ok", "reset": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset société : {e}"}
