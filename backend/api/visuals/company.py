# backend/api/visuals/company.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
from io import BytesIO

from PIL import Image
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
GCS_FOLDER = "companies"


# ============================================================
# MODELS
# ============================================================

class CompanyVisualUpload(BaseModel):
    id_company: str
    base64_image: str


class CompanyVisualReset(BaseModel):
    id_company: str


# ============================================================
# IMAGE UTILS
# ============================================================

def to_rectangle_logo(image_bytes: bytes) -> bytes:
    """
    Génère un logo rectangulaire simple.
    Pas de versionnement, pas de logique avancée.
    """
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((800, 400), Image.LANCZOS)

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


# ============================================================
# UPLOAD LOGO SOCIÉTÉ
# ============================================================

@router.post("/upload")
def upload_company_visual(payload: CompanyVisualUpload):
    try:
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        logo_bytes = to_rectangle_logo(image_bytes)

        # 🔒 NOM DÉTERMINISTE — UNE SOCIÉTÉ = UN FICHIER
        filename = f"COMPANY_{payload.id_company}_logo.jpg"

        # Upload GCS (overwrite autorisé)
        upload_bytes(GCS_FOLDER, filename, logo_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        client.query(
            f"""
            UPDATE `{TABLE_COMPANY}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = @fname,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "fname", "STRING", filename
                    ),
                    bigquery.ScalarQueryParameter(
                        "now", "TIMESTAMP", datetime.utcnow()
                    ),
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_company
                    ),
                ]
            )
        ).result()

        return {"status": "ok", "filename": filename}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "company_visual_upload_failed",
                "message": str(e),
            }
        )


# ============================================================
# RESET LOGO SOCIÉTÉ
# ============================================================

@router.post("/reset")
def reset_company_visual(payload: CompanyVisualReset):
    try:
        client = get_bigquery_client()

        rows = client.query(
            f"""
            SELECT MEDIA_LOGO_RECTANGLE_ID
            FROM `{TABLE_COMPANY}`
            WHERE ID_COMPANY = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_company
                    ),
                ]
            )
        ).result()

        old_file = None
        for r in rows:
            old_file = r["MEDIA_LOGO_RECTANGLE_ID"]

        # Suppression GCS si existant
        if old_file:
            delete_file(GCS_FOLDER, old_file)

        # Reset BigQuery
        client.query(
            f"""
            UPDATE `{TABLE_COMPANY}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "now", "TIMESTAMP", datetime.utcnow()
                    ),
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_company
                    ),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "company_visual_reset_failed",
                "message": str(e),
            }
        )
