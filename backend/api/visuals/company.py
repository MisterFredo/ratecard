# backend/api/visuals/company.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
import requests
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file

router = APIRouter()

BQ_TABLE_COMPANY = "adex-5555.RATECARD.RATECARD_COMPANY"


# --------------------------------------------------------------------
# MODELS
# --------------------------------------------------------------------

class CompanyVisualUpload(BaseModel):
    id_company: str
    filename: str          # ex: COMPANY_<id>_square.jpg ou COMPANY_<id>_rect.jpg
    base64_image: str      # image déjà transformée côté frontend (square/rect)


class CompanyApplyExisting(BaseModel):
    id_company: str
    square_url: str | None = None
    rectangle_url: str | None = None


class CompanyVisualReset(BaseModel):
    id_company: str


# --------------------------------------------------------------------
# UPLOAD (unitaire : square OU rectangle)
# --------------------------------------------------------------------
@router.post("/upload")
async def upload_company_visual(payload: CompanyVisualUpload):
    """
    Upload un visuel société → l'image est déjà recadrée côté frontend.
    Cette route gère un seul fichier : square OU rectangle.
    """
    try:
        id_company = payload.id_company
        filename = payload.filename.strip()

        # Base64 → bytes
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Upload GCS
        url = upload_bytes("companies", filename, image_bytes)

        # Déterminer colonne à mettre à jour
        if "square" in filename.lower():
            column = "MEDIA_LOGO_SQUARE_ID"
        elif "rect" in filename.lower():
            column = "MEDIA_LOGO_RECTANGLE_ID"
        else:
            raise HTTPException(400, "Le filename doit contenir 'square' ou 'rect'")

        # Mise à jour BQ
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_COMPANY}`
            SET {column} = @fname,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_company),
                ]
            )
        ).result()

        return {"status": "ok", "url": url}

    except Exception as e:
        raise HTTPException(400, f"Erreur upload société : {e}")


# --------------------------------------------------------------------
# APPLY EXISTING — copie depuis une URL publique
# --------------------------------------------------------------------
@router.post("/apply-existing")
async def apply_existing_company(payload: CompanyApplyExisting):
    """
    Clone une image distante et l'applique comme visuel square/rectangle.
    """
    try:
        id_company = payload.id_company
        client = get_bigquery_client()

        urls_to_process = []

        if payload.square_url:
            urls_to_process.append(("square", payload.square_url))

        if payload.rectangle_url:
            urls_to_process.append(("rect", payload.rectangle_url))

        results = {}

        for fmt, src_url in urls_to_process:
            # Télécharger l'image source
            try:
                img_bytes = requests.get(src_url).content
            except Exception:
                raise HTTPException(400, f"Impossible de télécharger {src_url}")

            filename = f"COMPANY_{id_company}_{fmt}.jpg"
            url = upload_bytes("companies", filename, img_bytes)

            column = "MEDIA_LOGO_SQUARE_ID" if fmt == "square" else "MEDIA_LOGO_RECTANGLE_ID"

            # Mise à jour BQ
            sql = f"""
                UPDATE `{BQ_TABLE_COMPANY}`
                SET {column} = @fname,
                    UPDATED_AT = @now
                WHERE ID_COMPANY = @id
            """

            client.query(
                sql,
                job_config=bigquery.QueryJobConfig(
                    query_parameters=[
                        bigquery.ScalarQueryParameter("fname", "STRING", filename),
                        bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                        bigquery.ScalarQueryParameter("id", "STRING", id_company),
                    ]
                )
            ).result()

            results[fmt] = url

        return {"status": "ok", "urls": results}

    except Exception as e:
        raise HTTPException(400, f"Erreur apply-existing société : {e}")


# --------------------------------------------------------------------
# RESET — supprime visuels GCS + BQ
# --------------------------------------------------------------------
@router.post("/reset")
async def reset_company_visual(payload: CompanyVisualReset):
    """
    Supprime les visuels square/rect de GCS + remet à NULL dans BigQuery.
    """
    try:
        id_company = payload.id_company

        # On récupère les anciens noms pour les supprimer de GCS
        client = get_bigquery_client()

        old_rows = client.query(
            f"""
            SELECT MEDIA_LOGO_SQUARE_ID, MEDIA_LOGO_RECTANGLE_ID
            FROM `{BQ_TABLE_COMPANY}`
            WHERE ID_COMPANY = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", id_company)
                ]
            )
        ).result()

        old_square = None
        old_rect = None

        for r in old_rows:
            old_square = r["MEDIA_LOGO_SQUARE_ID"]
            old_rect = r["MEDIA_LOGO_RECTANGLE_ID"]

        # Suppression GCS
        if old_square:
            delete_file("companies", old_square)

        if old_rect:
            delete_file("companies", old_rect)

        # Mise à jour BQ
        sql = f"""
            UPDATE `{BQ_TABLE_COMPANY}`
            SET MEDIA_LOGO_SQUARE_ID = NULL,
                MEDIA_LOGO_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_company),
                ]
            )
        ).result()

        return {"status": "ok", "reset": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset société : {e}")

