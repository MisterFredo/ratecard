from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from utils.gcs import upload_bytes, delete_file   # 🟩 NOUVEAU : module GCS
from datetime import datetime
from uuid import uuid4
from config import BQ_PROJECT, BQ_DATASET

from api.media.models import (
    MediaRegister,
    MediaAssign,
    MediaUnassign,
    MediaUpdateTitle
)

from google.cloud import bigquery

import base64

router = APIRouter()

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"


# ------------------------------------------------------------
# 🆕 REGISTER UPLOAD (UPLOAD GCS + INSERT BQ)
# ------------------------------------------------------------
@router.post("/register-upload")
def register_media_upload(payload: dict):
    """
    Upload d’un média vers Google Cloud Storage + enregistrement BigQuery.
    Reçoit :
    - filename
    - category
    - format (rectangle, square, original)
    - title (titre gouverné)
    - base64 (binaire image)
    """

    try:
        filename = payload["filename"]
        category = payload["category"]
        format_ = payload["format"]
        title = payload["title"]
        base64_data = payload["base64"]

        # Décodage du buffer image
        try:
            binary_data = base64.b64decode(base64_data)
        except Exception:
            raise HTTPException(400, "Invalid base64 image data")

        # Upload vers GCS
        url = upload_bytes(category, filename, binary_data)

        # Génération ID + insertion BigQuery
        media_id = str(uuid4())
        now = datetime.utcnow().isoformat()

        row = [{
            "ID_MEDIA": media_id,
            "FILEPATH": f"{category}/{filename}",   # chemin interne bucket
            "FORMAT": format_,
            "TITLE": title,
            "ENTITY_TYPE": None,
            "ENTITY_ID": None,
            "CREATED_AT": now,
        }]

        insert_bq(TABLE, row)

        return {
            "status": "ok",
            "item": {
                "media_id": media_id,
                "url": url,
                "format": format_,
                "folder": category
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur register-upload : {e}")


# ------------------------------------------------------------
# (Legacy) REGISTER — toujours là pour compatibilité mais non utilisé
# ------------------------------------------------------------
@router.post("/register")
def deprecated_register_media(payload: MediaRegister):
    """
    Compatibilité ancienne version.
    Ne fait plus rien en production.
    """
    raise HTTPException(400, "Deprecated : utilisez /register-upload")


# ------------------------------------------------------------
# ASSIGN
# ------------------------------------------------------------
@router.post("/assign")
def assign_media(payload: MediaAssign):
    try:
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{TABLE}`
            SET ENTITY_TYPE = @etype,
                ENTITY_ID = @eid
            WHERE ID_MEDIA = @mid
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("etype", "STRING", payload.entity_type),
                bigquery.ScalarQueryParameter("eid", "STRING", payload.entity_id),
                bigquery.ScalarQueryParameter("mid", "STRING", payload.media_id),
            ]
        )

        client.query(sql, job_config=job_config).result()

        return {"status": "ok", "assigned": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur assign media : {e}")


# ------------------------------------------------------------
# UNASSIGN
# ------------------------------------------------------------
@router.post("/unassign")
def unassign_media(payload: MediaUnassign):
    try:
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{TABLE}`
            SET ENTITY_TYPE = NULL,
                ENTITY_ID = NULL
            WHERE ID_MEDIA = @mid
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("mid", "STRING", payload.media_id),
            ]
        )

        client.query(sql, job_config=job_config).result()

        return {"status": "ok", "unassigned": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur unassign media : {e}")


# ------------------------------------------------------------
# BY ENTITY
# ------------------------------------------------------------
@router.get("/by-entity")
def get_by_entity(type: str, id: str):
    try:
        sql = f"""
            SELECT *
            FROM `{TABLE}`
            WHERE ENTITY_TYPE = @etype
              AND ENTITY_ID = @eid
            ORDER BY CREATED_AT DESC
        """

        rows = query_bq(sql, {"etype": type, "eid": id})
        return {"status": "ok", "media": rows}

    except Exception as e:
        raise HTTPException(400, f"Erreur by-entity : {e}")


# ------------------------------------------------------------
# LIST ALL MEDIA
# ------------------------------------------------------------
@router.get("/list")
def list_media():
    try:
        sql = f"SELECT * FROM `{TABLE}` ORDER BY CREATED_AT DESC"
        rows = query_bq(sql)
        return {"status": "ok", "media": rows}

    except Exception as e:
        raise HTTPException(400, f"Erreur list media : {e}")


# ------------------------------------------------------------
# DELETE (supprime BQ uniquement)
# ------------------------------------------------------------
@router.delete("/delete/{media_id}")
def delete_media(media_id: str):
    """
    Supprime un média (BigQuery uniquement).
    Le fichier physique GCS peut être supprimé plus tard si besoin.
    """
    try:
        client = get_bigquery_client()

        sql = f"DELETE FROM `{TABLE}` WHERE ID_MEDIA = @mid"

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("mid", "STRING", media_id),
            ]
        )

        client.query(sql, job_config=job_config).result()

        return {"status": "ok", "deleted": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur delete media : {e}")


# ------------------------------------------------------------
# UPDATE TITLE
# ------------------------------------------------------------
@router.put("/update-title")
def update_media_title(payload: MediaUpdateTitle):
    """
    Modifie le titre (gouverné) d’un média.
    """
    try:
        client = get_bigquery_client()

        sql = f"""
            UPDATE `{TABLE}`
            SET TITLE = @title
            WHERE ID_MEDIA = @mid
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("title", "STRING", payload.title),
                bigquery.ScalarQueryParameter("mid", "STRING", payload.media_id),
            ]
        )

        client.query(sql, job_config=job_config).result()

        return {"status": "ok", "updated": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur update title : {e}")

