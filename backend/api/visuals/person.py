from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64

from google.cloud import bigquery
from utils.bigquery_utils import get_bigquery_client
from utils.gcs_service import upload_image_buffer

router = APIRouter()

BQ_TABLE_PERSON = "adex-5555.RATECARD.RATECARD_PERSON"


# -------------------------------------------------------------------
# Payload upload manuel
# -------------------------------------------------------------------
class PersonVisualUpload(BaseModel):
    id_person: str
    base64_image: str     # image brute envoyée par le front
    want_rectangle: bool = True  # optionnel : rectangulaire ou non


# -------------------------------------------------------------------
# Upload photo (manuel)
# -------------------------------------------------------------------
@router.post("/upload")
async def upload_person_visual(payload: PersonVisualUpload):
    """
    Upload manuel d’un portrait :
    - obligatoire carré (600×600)
    - optionnel rectangle (1200×900)
    - stockage GCS
    - mise à jour BigQuery
    """

    try:
        id_person = payload.id_person

        # Décodage base64
        try:
            raw_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # On utilise sharp (ou équivalent backend) pour transformer
        import sharp

        # Carré obligatoire
        square_bytes = sharp(raw_bytes).resize(600, 600).jpeg().to_buffer()

        # Option rectangle
        rect_bytes = None
        if payload.want_rectangle:
            rect_bytes = sharp(raw_bytes).resize(1200, 900).jpeg().to_buffer()

        # Filenames normalisés
        square_name = f"PERSON_{id_person}_square.jpg"
        rect_name = f"PERSON_{id_person}_rect.jpg" if rect_bytes else None

        # Upload GCS
        square_url = upload_image_buffer("persons", square_name, square_bytes)
        rect_url = None
        if rect_bytes:
            rect_url = upload_image_buffer("persons", rect_name, rect_bytes)

        # Update BQ
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{BQ_TABLE_PERSON}`
            SET MEDIA_PICTURE_SQUARE_ID = @square,
                MEDIA_PICTURE_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_PERSON = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_person),
                ]
            ),
        ).result()

        return {
            "status": "ok",
            "urls": {
                "square": square_url,
                "rectangle": rect_url,
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur upload portrait personne : {e}")


# -------------------------------------------------------------------
# Application d’un visuel externe (ex : copie société ou axe)
# -------------------------------------------------------------------
class PersonApplyExisting(BaseModel):
    id_person: str
    square_url: str       # obligatoire
    rectangle_url: str | None = None


@router.post("/apply-existing")
async def apply_existing_person(payload: PersonApplyExisting):
    """
    Applique un visuel déjà existant (copie depuis URL).
    Les fichiers sont ré-uploadés pour être dédiés à la personne.
    """

    try:
        import requests

        id_person = payload.id_person

        # Télécharger square obligatoire
        square_bytes = requests.get(payload.square_url).content

        rect_bytes = None
        if payload.rectangle_url:
            rect_bytes = requests.get(payload.rectangle_url).content

        # Filenames dédiés
        square_name = f"PERSON_{id_person}_square.jpg"
        rect_name = f"PERSON_{id_person}_rect.jpg" if rect_bytes else None

        # Upload GCS
        square_url = upload_image_buffer("persons", square_name, square_bytes)

        rect_url = None
        if rect_bytes:
            rect_url = upload_image_buffer("persons", rect_name, rect_bytes)

        # Update BQ
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_PERSON}`
            SET MEDIA_PICTURE_SQUARE_ID = @square,
                MEDIA_PICTURE_RECTANGLE_ID = @rect,
                UPDATED_AT = @now
            WHERE ID_PERSON = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("square", "STRING", square_name),
                    bigquery.ScalarQueryParameter("rect", "STRING", rect_name),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_person),
                ]
            ),
        ).result()

        return {
            "status": "ok",
            "urls": {
                "square": square_url,
                "rectangle": rect_url,
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur apply-existing (person) : {e}")
