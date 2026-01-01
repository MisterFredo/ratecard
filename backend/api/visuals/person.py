# backend/api/visuals/person.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
import requests

from google.cloud import bigquery
from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file

router = APIRouter()

BQ_TABLE_PERSON = "adex-5555.RATECARD.RATECARD_PERSON"


# ============================================================
# MODELS
# ============================================================

class PersonVisualUpload(BaseModel):
    """
    Upload d’un portrait de personne.
    Le frontend génère déjà le carré / rectangle.
    """
    id_person: str
    filename: str          # doit contenir "square" ou "rect"
    base64_image: str      # image transformée côté front


class PersonApplyExisting(BaseModel):
    id_person: str
    square_url: str | None = None
    rectangle_url: str | None = None


class PersonVisualReset(BaseModel):
    id_person: str


# ============================================================
# UPLOAD (square OU rectangle)
# ============================================================
@router.post("/upload")
async def upload_person_visual(payload: PersonVisualUpload):
    """
    Upload d’un portrait (square OU rectangle).
    Pas de sharp backend : image déjà transformée côté front.
    """
    try:
        id_person = payload.id_person
        filename = payload.filename.strip()

        # Validation format
        if "square" not in filename.lower() and "rect" not in filename.lower():
            raise HTTPException(400, "Le filename doit contenir 'square' ou 'rect'")

        # Base64 → bytes
        try:
            img_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Upload dans GCS
        url = upload_bytes("persons", filename, img_bytes)

        # Choix colonne BQ
        column = "MEDIA_PICTURE_SQUARE_ID" if "square" in filename.lower() else "MEDIA_PICTURE_RECTANGLE_ID"

        # Update BQ
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_PERSON}`
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
                    bigquery.ScalarQueryParameter("id", "STRING", id_person),
                ]
            )
        ).result()

        return {"status": "ok", "url": url}

    except Exception as e:
        raise HTTPException(400, f"Erreur upload portrait personne : {e}")


# ============================================================
# APPLY EXISTING (clone d'un autre média)
# ============================================================
@router.post("/apply-existing")
async def apply_existing_person(payload: PersonApplyExisting):
    """
    Copie un portrait existant (square et/ou rectangle) et le réimporte
    pour l'associer à cette personne.
    """
    try:
        id_person = payload.id_person
        client = get_bigquery_client()
        results = {}

        items = []

        if payload.square_url:
            items.append(("square", payload.square_url))
        if payload.rectangle_url:
            items.append(("rect", payload.rectangle_url))

        for fmt, src_url in items:
            try:
                img_bytes = requests.get(src_url).content
            except Exception:
                raise HTTPException(400, f"Impossible de télécharger {src_url}")

            filename = f"PERSON_{id_person}_{fmt}.jpg"
            url = upload_bytes("persons", filename, img_bytes)

            column = "MEDIA_PICTURE_SQUARE_ID" if fmt == "square" else "MEDIA_PICTURE_RECTANGLE_ID"

            sql = f"""
                UPDATE `{BQ_TABLE_PERSON}`
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
                        bigquery.ScalarQueryParameter("id", "STRING", id_person),
                    ]
                )
            ).result()

            results[fmt] = url

        return {"status": "ok", "urls": results}

    except Exception as e:
        raise HTTPException(400, f"Erreur apply-existing personne : {e}")


# ============================================================
# RESET (supprime BQ + fichiers GCS)
# ============================================================
@router.post("/reset")
async def reset_person_visual(payload: PersonVisualReset):
    """
    Supprime les visuels associés à une personne :
    - supprime fichiers GCS
    - met à NULL dans BigQuery
    """
    try:
        id_person = payload.id_person
        client = get_bigquery_client()

        # Lire valeurs actuelles
        query = client.query(
            f"""
            SELECT MEDIA_PICTURE_SQUARE_ID, MEDIA_PICTURE_RECTANGLE_ID
            FROM `{BQ_TABLE_PERSON}`
            WHERE ID_PERSON = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", id_person)
                ]
            )
        )

        rows = list(query.result())
        old_square = rows[0]["MEDIA_PICTURE_SQUARE_ID"] if rows else None
        old_rect = rows[0]["MEDIA_PICTURE_RECTANGLE_ID"] if rows else None

        # Suppression GCS
        if old_square:
            delete_file("persons", old_square)
        if old_rect:
            delete_file("persons", old_rect)

        # Reset BQ
        sql = f"""
            UPDATE `{BQ_TABLE_PERSON}`
            SET MEDIA_PICTURE_SQUARE_ID = NULL,
                MEDIA_PICTURE_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_PERSON = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_person),
                ]
            )
        ).result()

        return {"status": "ok", "reset": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset portrait personne : {e}")

