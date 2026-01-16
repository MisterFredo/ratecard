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
    base64_image: str        # image encodée côté frontend


class CompanyVisualReset(BaseModel):
    id_company: str


# ============================================================
# IMAGE UTILS — RECTANGLE ONLY (16:9)
# ============================================================

def generate_rectangle(image_bytes: bytes) -> bytes:
    """
    Génère un visuel rectangulaire 1200x675 (16:9) centré.
    """
    img = Image.open(BytesIO(image_bytes)).convert("RGB")

    target_ratio = 16 / 9
    img_ratio = img.width / img.height

    if img_ratio > target_ratio:
        # trop large → crop largeur
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        rect = img.crop((left, 0, left + new_width, img.height))
    else:
        # trop haut → crop hauteur
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        rect = img.crop((0, top, img.width, top + new_height))

    rect = rect.resize((1200, 675), Image.LANCZOS)

    buf = BytesIO()
    rect.save(buf, format="JPEG", quality=90)

    return buf.getvalue()


# ============================================================
# UPLOAD VISUAL — RECTANGLE ONLY
# ============================================================

@router.post("/upload")
def upload_company_visual(payload: CompanyVisualUpload):
    try:
        # Decode base64
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Generate rectangle
        rect_bytes = generate_rectangle(image_bytes)
        rect_filename = f"COMPANY_{payload.id_company}_rect.jpg"

        # Upload to GCS
        upload_bytes(GCS_FOLDER, rect_filename, rect_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE_COMPANY}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "rect", "STRING", rect_filename
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

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur upload visuel société : {e}"
        )


# ============================================================
# RESET VISUAL — RECTANGLE ONLY
# ============================================================

@router.post("/reset")
def reset_company_visual(payload: CompanyVisualReset):
    try:
        client = get_bigquery_client()

        # Récupération ancien visuel rectangle
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

        old_rect = None
        for r in rows:
            old_rect = r["MEDIA_LOGO_RECTANGLE_ID"]

        # Suppression GCS
        if old_rect:
            delete_file(GCS_FOLDER, old_rect)

        # Reset BigQuery
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

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur reset visuel société : {e}"
        )
