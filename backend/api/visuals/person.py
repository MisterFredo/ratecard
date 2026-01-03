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

TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"
GCS_FOLDER = "persons"


# ============================================================
# MODELS
# ============================================================

class PersonVisualUpload(BaseModel):
    id_person: str
    format: str              # conservé pour compat front (non bloquant)
    base64_image: str        # image encodée côté frontend


class PersonVisualReset(BaseModel):
    id_person: str


# ============================================================
# IMAGE UTILS
# ============================================================

def generate_square_and_rect(image_bytes: bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGB")

    # --- Square 512x512 (crop center)
    min_side = min(img.size)
    left = (img.width - min_side) // 2
    top = (img.height - min_side) // 2
    square = img.crop((left, top, left + min_side, top + min_side))
    square = square.resize((512, 512), Image.LANCZOS)

    square_buf = BytesIO()
    square.save(square_buf, format="JPEG", quality=90)

    # --- Rectangle 1200x630 (crop center)
    target_ratio = 1200 / 630
    img_ratio = img.width / img.height

    if img_ratio > target_ratio:
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        rect = img.crop((left, 0, left + new_width, img.height))
    else:
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        rect = img.crop((0, top, img.width, top + new_height))

    rect = rect.resize((1200, 630), Image.LANCZOS)

    rect_buf = BytesIO()
    rect.save(rect_buf, format="JPEG", quality=90)

    return square_buf.getvalue(), rect_buf.getvalue()


# ============================================================
# UPLOAD VISUAL
# ============================================================

@router.post("/upload")
def upload_person_visual(payload: PersonVisualUpload):
    try:
        # Decode base64
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Generate image variants
        square_bytes, rect_bytes = generate_square_and_rect(image_bytes)

        square_filename = f"PERSON_{payload.id_person}_square.jpg"
        rect_filename = f"PERSON_{payload.id_person}_rect.jpg"

        # Upload to GCS
        upload_bytes(GCS_FOLDER, square_filename, square_bytes)
        upload_bytes(GCS_FOLDER, rect_filename, rect_bytes)

        # Update BigQuery
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE_PERSON}`
            SET
                MEDIA_PICTURE_SQUARE_ID = @square,
                MEDIA_PICTURE_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_PERSON = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_filename),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_filename),
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

