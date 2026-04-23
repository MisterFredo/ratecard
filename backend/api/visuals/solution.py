# backend/api/visuals/solution.py

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

TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"
GCS_FOLDER = "solutions"


# ============================================================
# MODELS
# ============================================================

class SolutionVisualUpload(BaseModel):
    id_solution: str
    base64_image: str


class SolutionVisualReset(BaseModel):
    id_solution: str


# ============================================================
# IMAGE UTILS (identique company)
# ============================================================

def to_rectangle_logo(image_bytes: bytes) -> bytes:
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((800, 400), Image.LANCZOS)

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


# ============================================================
# UPLOAD LOGO SOLUTION
# ============================================================

@router.post("/upload")
def upload_solution_visual(payload: SolutionVisualUpload):

    try:
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        logo_bytes = to_rectangle_logo(image_bytes)

        # 🔥 NOM DÉTERMINISTE
        filename = f"SOLUTION_{payload.id_solution}_logo.jpg"

        # Upload GCS
        upload_bytes(GCS_FOLDER, filename, logo_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        client.query(
            f"""
            UPDATE `{TABLE_SOLUTION}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = @fname,
                UPDATED_AT = @now
            WHERE ID_SOLUTION = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_solution),
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
                "error": "solution_visual_upload_failed",
                "message": str(e),
            }
        )


# ============================================================
# RESET LOGO SOLUTION
# ============================================================

@router.post("/reset")
def reset_solution_visual(payload: SolutionVisualReset):

    try:
        client = get_bigquery_client()

        rows = client.query(
            f"""
            SELECT MEDIA_LOGO_RECTANGLE_ID
            FROM `{TABLE_SOLUTION}`
            WHERE ID_SOLUTION = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_solution),
                ]
            )
        ).result()

        old_file = None
        for r in rows:
            old_file = r["MEDIA_LOGO_RECTANGLE_ID"]

        # Suppression GCS
        if old_file:
            delete_file(GCS_FOLDER, old_file)

        # Reset BQ
        client.query(
            f"""
            UPDATE `{TABLE_SOLUTION}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_SOLUTION = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_solution),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "solution_visual_reset_failed",
                "message": str(e),
            }
        )
