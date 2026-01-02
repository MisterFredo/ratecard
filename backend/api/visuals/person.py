from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"
GCS_FOLDER = "persons"


# ============================================================
# MODELS
# ============================================================

class PersonVisualUpload(BaseModel):
    id_person: str
    format: str              # "square" | "rectangle"
    base64_image: str        # image encodée côté frontend


class PersonVisualReset(BaseModel):
    id_person: str


# ============================================================
# UPLOAD VISUAL (POST-CREATION ONLY)
# ============================================================
@router.post("/upload")
def upload_person_visual(payload: PersonVisualUpload):
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
        filename = f"PERSON_{payload.id_person}_{suffix}.jpg"

        column = (
            "MEDIA_PICTURE_SQUARE_ID"
            if payload.format == "square"
            else "MEDIA_PICTURE_RECTANGLE_ID"
        )

        # Upload GCS
        upload_bytes(GCS_FOLDER, filename, image_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE_PERSON}`
            SET {column} = @fname,
                UPDATED_AT = @now
            WHERE ID_PERSON = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_person),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(400, f"Erreur upload visuel personne : {e}")


# ============================================================
# RESET VISUALS
# ============================================================
@router.post("/reset")
def reset_person_visual(payload: PersonVisualReset):
    try:
        client = get_bigquery_client()

        # Récupération anciens visuels
        sql_select = f"""
            SELECT MEDIA_PICTURE_SQUARE_ID, MEDIA_PICTURE_RECTANGLE_ID
            FROM `{TABLE_PERSON}`
            WHERE ID_PERSON = @id
        """

        rows = client.query(
            sql_select,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_person)
                ]
            )
        ).result()

        old_square = None
        old_rect = None

        for r in rows:
            old_square = r["MEDIA_PICTURE_SQUARE_ID"]
            old_rect = r["MEDIA_PICTURE_RECTANGLE_ID"]

        # Suppression GCS
        if old_square:
            delete_file(GCS_FOLDER, old_square)

        if old_rect:
            delete_file(GCS_FOLDER, old_rect)

        # Reset BigQuery
        sql_update = f"""
            UPDATE `{TABLE_PERSON}`
            SET
                MEDIA_PICTURE_SQUARE_ID = NULL,
                MEDIA_PICTURE_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_PERSON = @id
        """

        client.query(
            sql_update,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_person),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset visuels personne : {e}")
