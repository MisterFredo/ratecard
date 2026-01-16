from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
from datetime import datetime

from google.cloud import bigquery
from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file
from utils.image import to_rectangle_16_9
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
GCS_FOLDER = "news"


# ============================================================
# MODELS
# ============================================================

class NewsVisualUpload(BaseModel):
    id_news: str
    base64_image: str


class NewsVisualReset(BaseModel):
    id_news: str


# ============================================================
# UPLOAD VISUEL NEWS (RECTANGLE ONLY)
# ============================================================

@router.post("/upload")
def upload_news_visual(payload: NewsVisualUpload):
    try:
        try:
            img_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        rect_bytes = to_rectangle_16_9(img_bytes)
        filename = f"NEWS_{payload.id_news}_rect.jpg"

        # Upload GCS
        upload_bytes(GCS_FOLDER, filename, rect_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        client.query(
            f"""
            UPDATE `{TABLE_NEWS}`
            SET
                MEDIA_RECTANGLE_ID = @fname,
                UPDATED_AT = @now
            WHERE ID_NEWS = @id
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
                        "id", "STRING", payload.id_news
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
                "error": "news_visual_upload_failed",
                "message": str(e),
            }
        )


# ============================================================
# RESET VISUEL NEWS
# ============================================================

@router.post("/reset")
def reset_news_visual(payload: NewsVisualReset):
    try:
        client = get_bigquery_client()

        rows = client.query(
            f"""
            SELECT MEDIA_RECTANGLE_ID
            FROM `{TABLE_NEWS}`
            WHERE ID_NEWS = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_news
                    ),
                ]
            )
        ).result()

        old_file = None
        for r in rows:
            old_file = r["MEDIA_RECTANGLE_ID"]

        # Suppression GCS
        if old_file:
            delete_file(GCS_FOLDER, old_file)

        # Reset BigQuery
        client.query(
            f"""
            UPDATE `{TABLE_NEWS}`
            SET
                MEDIA_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_NEWS = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "now", "TIMESTAMP", datetime.utcnow()
                    ),
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", payload.id_news
                    ),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "news_visual_reset_failed",
                "message": str(e),
            }
        )
