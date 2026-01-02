from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
GCS_FOLDER = "topics"


# ============================================================
# MODELS
# ============================================================

class TopicVisualUpload(BaseModel):
    id_topic: str
    format: str              # "square" | "rectangle"
    base64_image: str        # image encodée côté frontend


class TopicVisualReset(BaseModel):
    id_topic: str


# ============================================================
# UPLOAD VISUAL (POST-CREATION ONLY)
# ============================================================
@router.post("/upload")
def upload_topic_visual(payload: TopicVisualUpload):
    try:
        if payload.format not in ("square", "rectangle"):
            raise HTTPException(400, "Format invalide (square | rectangle)")

        # Decode base64
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Filename & column
        suffix = "square" if payload.format == "square" else "rect"
        filename = f"TOPIC_{payload.id_topic}_{suffix}.jpg"

        column = (
            "MEDIA_SQUARE_ID"
            if payload.format == "square"
            else "MEDIA_RECTANGLE_ID"
        )

        # Upload GCS
        upload_bytes(GCS_FOLDER, filename, image_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE_TOPIC}`
            SET {column} = @fname,
                UPDATED_AT = @now
            WHERE ID_TOPIC = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_topic),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(400, f"Erreur upload visuel topic : {e}")


# ============================================================
# RESET VISUALS
# ============================================================
@router.post("/reset")
def reset_topic_visual(payload: TopicVisualReset):
    try:
        client = get_bigquery_client()

        # Récupération anciens visuels
        sql_select = f"""
            SELECT MEDIA_SQUARE_ID, MEDIA_RECTANGLE_ID
            FROM `{TABLE_TOPIC}`
            WHERE ID_TOPIC = @id
        """

        rows = client.query(
            sql_select,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_topic)
                ]
            )
        ).result()

        old_square = None
        old_rect = None

        for r in rows:
            old_square = r["MEDIA_SQUARE_ID"]
            old_rect = r["MEDIA_RECTANGLE_ID"]

        # Suppression GCS
        if old_square:
            delete_file(GCS_FOLDER, old_square)

        if old_rect:
            delete_file(GCS_FOLDER, old_rect)

        # Reset BigQuery
        sql_update = f"""
            UPDATE `{TABLE_TOPIC}`
            SET
                MEDIA_SQUARE_ID = NULL,
                MEDIA_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_TOPIC = @id
        """

        client.query(
            sql_update,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_topic),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset visuels topic : {e}")
