from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from utils.gcs import upload_bytes, delete_file
from datetime import datetime
from uuid import uuid4
from config import BQ_PROJECT, BQ_DATASET

from api.media.models import (
    MediaAssign,
    MediaUnassign,
    MediaUpdateTitle
)

from google.cloud import bigquery
import base64   # 🔥🔥🔥 OBLIGATOIRE

router = APIRouter()

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"


# =====================================================================
# 🆕 REGISTER UPLOAD (GCS + BigQuery)
# =====================================================================
@router.post("/register-upload")
async def register_media_upload(request: Request):
    try:
        payload = await request.json()
        
        required = ["filename", "category", "format", "title", "base64"]
        for field in required:
            if field not in payload or not payload[field]:
                raise HTTPException(400, f"Missing field: {field}")

        filename = payload["filename"]
        category = payload["category"]
        format_ = payload["format"]
        title = payload["title"]
        base64_data = payload["base64"]

        binary_data = base64.b64decode(base64_data)

        url = upload_bytes(category, filename, binary_data)

        media_id = str(uuid4())
        now = datetime.utcnow().isoformat()

        row = [{
            "ID_MEDIA": media_id,
            "FILEPATH": f"{category}/{filename}",
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
                "folder": category,
            }
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur register-upload : {e}")

# =====================================================================
# ❌ Legacy REGISTER (désactivé)
# =====================================================================
@router.post("/register")
def deprecated_register_media(_payload):
    raise HTTPException(400, "Deprecated: utilisez /register-upload")


# =====================================================================
# ASSIGN MEDIA
# =====================================================================
@router.post("/assign")
def assign_media(payload: MediaAssign):
    """
    Associe un média à une entité (company, person, axe, article).
    """
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


# =====================================================================
# UNASSIGN
# =====================================================================
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


# =====================================================================
# BY ENTITY
# =====================================================================
@router.get("/by-entity")
def get_by_entity(type: str, id: str):
    """
    Retourne la liste des médias associés à une entité.
    """
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


# =====================================================================
# LIST ALL
# =====================================================================
@router.get("/list")
def list_media():
    try:
        sql = f"SELECT * FROM `{TABLE}` ORDER BY CREATED_AT DESC"
        rows = query_bq(sql)
        return {"status": "ok", "media": rows}

    except Exception as e:
        raise HTTPException(400, f"Erreur list media : {e}")


# =====================================================================
# DELETE (BQ only)
# =====================================================================
@router.delete("/delete/{media_id}")
def delete_media(media_id: str):
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


# =====================================================================
# UPDATE TITLE
# =====================================================================
@router.put("/update-title")
def update_media_title(payload: MediaUpdateTitle):
    """
    Met à jour le titre gouverné.
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


