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

TABLE_SOURCE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOURCE"
GCS_FOLDER = "sources"


# ============================================================
# MODELS
# ============================================================

class SourceVisualUpload(BaseModel):
    id_source: str
    base64_image: str


class SourceVisualReset(BaseModel):
    id_source: str


# ============================================================
# IMAGE UTILS (on garde EXACTEMENT le même)
# ============================================================

def to_rectangle_logo(image_bytes: bytes) -> bytes:
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((800, 400), Image.LANCZOS)

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


# ============================================================
# UPLOAD LOGO SOURCE
# ============================================================

@router.post("/upload")
def upload_source_visual(payload: SourceVisualUpload):
    try:
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        logo_bytes = to_rectangle_logo(image_bytes)

        # 🔒 NOM DÉTERMINISTE
        filename = f"SOURCE_{payload.id_source}_logo.jpg"

        # Upload GCS
        upload_bytes(GCS_FOLDER, filename, logo_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        client.query(
            f"""
            UPDATE `{TABLE_SOURCE}`
            SET
                LOGO = @fname,
                UPDATED_AT = @now
            WHERE SOURCE_ID = @id
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
                        "id", "STRING", payload.id_source
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
                "error": "source_visual_upload_failed",
                "message": str(e),
            }
        )


# ============================================================
# RESET LOGO SOURCE
# ============================================================

@router.post("/reset")
def reset_source_visual(payload: SourceVisualReset):
    try:
        client = get_bigquery_client()

        rows = client.query(
            f"""
            SELECT LOGO
            FROM `{TABLE_SOURCE}`
            WHERE SOURCE_ID = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_source
                    ),
                ]
            )
        ).result()

        old_file = None
        for r in rows:
            old_file = r["LOGO"]

        if old_file:
            delete_file(GCS_FOLDER, old_file)

        client.query(
            f"""
            UPDATE `{TABLE_SOURCE}`
            SET
                LOGO = NULL,
                UPDATED_AT = @now
            WHERE SOURCE_ID = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "now", "TIMESTAMP", datetime.utcnow()
                    ),
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_source
                    ),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "source_visual_reset_failed",
                "message": str(e),
            }
        )
