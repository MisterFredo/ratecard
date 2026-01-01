# backend/api/visuals/axe.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
import requests
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file

router = APIRouter()

BQ_TABLE_AXE = "adex-5555.RATECARD.RATECARD_AXE"


# ============================================================
# MODELS
# ============================================================

class AxeVisualUpload(BaseModel):
    """
    Upload un visuel unique d’un axe (square OU rectangle).
    L’image est déjà transformée côté frontend.
    """
    id_axe: str
    filename: str          # doit contenir "square" ou "rect"
    base64_image: str


class AxeApplyExisting(BaseModel):
    id_axe: str
    square_url: str | None = None
    rectangle_url: str | None = None


class AxeVisualReset(BaseModel):
    id_axe: str


# ============================================================
# UPLOAD (square OU rect)
# ============================================================
@router.post("/upload")
async def upload_axe_visual(payload: AxeVisualUpload):
    """
    Upload d’un visuel d'axe.
    L’image est déjà square OU rect côté frontend.
    """
    try:
        id_axe = payload.id_axe
        filename = payload.filename.strip()

        # Validation du format
        if "square" not in filename.lower() and "rect" not in filename.lower():
            raise HTTPException(400, "Le filename doit contenir 'square' ou 'rect'")

        # Base64 → bytes
        try:
            image_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        # Upload GCS
        url = upload_bytes("axes", filename, image_bytes)

        # Choix colonne BQ
        if "square" in filename.lower():
            column = "MEDIA_SQUARE_ID"
        else:
            column = "MEDIA_RECTANGLE_ID"

        # UPDATE BQ
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{BQ_TABLE_AXE}`
            SET {column} = @fname,
                UPDATED_AT = @now
            WHERE ID_AXE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_axe),
                ]
            )
        ).result()

        return {"status": "ok", "url": url}

    except Exception as e:
        raise HTTPException(400, f"Erreur upload visuel axe : {e}")


# ============================================================
# APPLY EXISTING (clone)
# ============================================================
@router.post("/apply-existing")
async def apply_existing_axe(payload: AxeApplyExisting):
    """
    Télécharge un visuel existant et le copie pour un axe.
    """
    try:
        id_axe = payload.id_axe
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

            filename = f"AXE_{id_axe}_{fmt}.jpg"
            url = upload_bytes("axes", filename, img_bytes)

            column = "MEDIA_SQUARE_ID" if fmt == "square" else "MEDIA_RECTANGLE_ID"

            sql = f"""
                UPDATE `{BQ_TABLE_AXE}`
                SET {column} = @fname,
                    UPDATED_AT = @now
                WHERE ID_AXE = @id
            """

            client.query(
                sql,
                job_config=bigquery.QueryJobConfig(
                    query_parameters=[
                        bigquery.ScalarQueryParameter("fname", "STRING", filename),
                        bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                        bigquery.ScalarQueryParameter("id", "STRING", id_axe),
                    ]
                )
            ).result()

            results[fmt] = url

        return {"status": "ok", "urls": results}

    except Exception as e:
        raise HTTPException(400, f"Erreur apply-existing axe : {e}")


# ============================================================
# RESET (supprime BQ + fichiers GCS)
# ============================================================
@router.post("/reset")
async def reset_axe_visual(payload: AxeVisualReset):
    """
    Supprime les visuels associés à un axe :
    - supprime fichiers GCS
    - remet les ID à NULL en BQ
    """
    try:
        id_axe = payload.id_axe
        client = get_bigquery_client()

        # Récupération des anciens fichiers
        query = client.query(
            f"""
            SELECT MEDIA_SQUARE_ID, MEDIA_RECTANGLE_ID
            FROM `{BQ_TABLE_AXE}`
            WHERE ID_AXE = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", id_axe)
                ]
            )
        )

        rows = list(query.result())
        old_square = rows[0]["MEDIA_SQUARE_ID"] if rows else None
        old_rect = rows[0]["MEDIA_RECTANGLE_ID"] if rows else None

        # Suppression GCS
        if old_square:
            delete_file("axes", old_square)
        if old_rect:
            delete_file("axes", old_rect)

        # Mise à jour BQ
        sql = f"""
            UPDATE `{BQ_TABLE_AXE}`
            SET MEDIA_SQUARE_ID = NULL,
                MEDIA_RECTANGLE_ID = NULL,
                UPDATED_AT = @now
            WHERE ID_AXE = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", id_axe),
                ]
            )
        ).result()

        return {"status": "ok", "reset": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur reset axe : {e}")

