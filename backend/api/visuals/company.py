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

# ⚠️ Base publique GCS — DOIT matcher le front
GCS_PUBLIC_BASE_URL = "https://storage.googleapis.com/ratecard-assets"


# ============================================================
# MODELS
# ============================================================

class CompanyVisualUpload(BaseModel):
    id_company: str
    base64_image: str  # image encodée côté frontend


class CompanyVisualReset(BaseModel):
    id_company: str


# ============================================================
# IMAGE UTILS — LOGO ONLY (NO CROP)
# ============================================================

def generate_logo(image_bytes: bytes) -> bytes:
    """
    Génère un logo sans crop, proportions respectées.
    Redimensionnement max uniquement.
    """
    img = Image.open(BytesIO(image_bytes)).convert("RGB")

    MAX_WIDTH = 800
    MAX_HEIGHT = 400

    img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=90)

    return buf.getvalue()


# ============================================================
# UPLOAD VISUAL — LOGO ONLY
# ============================================================

@router.post("/upload")
def upload_company_visual(payload: CompanyVisualUpload):
    try:
        # -----------------------------------------------------
        # Decode base64
        # -----------------------------------------------------
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # -----------------------------------------------------
        # Generate logo (NO CROP)
        # -----------------------------------------------------
        logo_bytes = generate_logo(image_bytes)
        logo_filename = f"COMPANY_{payload.id_company}_logo.jpg"

        # -----------------------------------------------------
        # Upload to GCS
        # -----------------------------------------------------
        upload_bytes(GCS_FOLDER, logo_filename, logo_bytes)

        # -----------------------------------------------------
        # Update BigQuery
        # -----------------------------------------------------
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE_COMPANY}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = @logo,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "logo", "STRING", logo_filename
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

        public_url = (
            f"{GCS_PUBLIC_BASE_URL}/{GCS_FOLDER}/{logo_filename}"
        )

        # 🔑 CONTRAT API CLAIR
        return {
            "status": "ok",
            "filename": logo_filename,
            "public_url": public_url,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur upload visuel société : {e}"
        )


# ============================================================
# RESET VISUAL — LOGO ONLY
# ============================================================

@router.post("/reset")
def reset_company_visual(payload: CompanyVisualReset):
    try:
        client = get_bigquery_client()

        # -----------------------------------------------------
        # Récupération ancien logo
        # -----------------------------------------------------
        sql_select = f"""
            SELECT MEDIA_LOGO_RECTANGLE_ID
            FROM `{TABLE_COMPANY}`
            WHERE ID_COMPANY = @id
        """

        rows = client.query(
            sql_select,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_company
                    )
                ]
            )
        ).result()

        old_logo = None
        for r in rows:
            old_logo = r["MEDIA_LOGO_RECTANGLE_ID"]

        # -----------------------------------------------------
        # Suppression GCS
        # -----------------------------------------------------
        if old_logo:
            delete_file(GCS_FOLDER, old_logo)

        # -----------------------------------------------------
        # Reset BigQuery
        # -----------------------------------------------------
        sql_update = f"""
            UPDATE `{TABLE_COMPANY}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql_update,
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

        # 🔑 CONTRAT API SYMÉTRIQUE
        return {
            "status": "ok",
            "filename": None,
            "public_url": None,
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur reset visuel société : {e}"
        )
