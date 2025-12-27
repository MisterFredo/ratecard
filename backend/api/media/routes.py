# backend/api/media/routes.py

from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from datetime import datetime
from uuid import uuid4
from config import BQ_PROJECT, BQ_DATASET

# Import des modèles
from api.media.models import MediaRegister, MediaAssign, MediaUnassign, MediaUpdateTitle

from google.cloud import bigquery   # ⬅️ nécessaire pour QueryJobConfig & ScalarQueryParameter

router = APIRouter()

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"

# ------------------------------------------------------------
# REGISTER (appelé par Next.js après upload)
# ------------------------------------------------------------
@router.post("/register")
def register_media(payload: MediaRegister):
    """
    Enregistre un média dans BigQuery après upload Next.js.
    Retourne ID_MEDIA.
    """
    try:
        media_id = str(uuid4())
        now = datetime.utcnow().isoformat()

        row = [{
            "ID_MEDIA": media_id,
            "FILEPATH": payload.filepath,
            "FORMAT": payload.format,
            "ENTITY_TYPE": None,
            "ENTITY_ID": None,
            "TITLE": payload.title,
            "CREATED_AT": now,
        }]

        insert_bq(TABLE, row)

        return {"status": "ok", "media_id": media_id}

    except Exception as e:
        raise HTTPException(400, f"Erreur register media : {e}")


# ------------------------------------------------------------
# ASSIGN MEDIA TO ENTITY
# ------------------------------------------------------------
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


# ------------------------------------------------------------
# UNASSIGN MEDIA
# ------------------------------------------------------------
@router.post("/unassign")
def unassign_media(payload: MediaUnassign):
    """
    Retire un média de l’entité à laquelle il était assigné.
    """
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
    """
    Retourne la liste des médias liés à une entité.
    Compatible front : ?type=company&id=UUID
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


# ------------------------------------------------------------
# LIST ALL MEDIA
# ------------------------------------------------------------
@router.get("/list")
def list_media():
    """Retourne tous les médias, sans filtrage."""
    try:
        sql = f"SELECT * FROM `{TABLE}` ORDER BY CREATED_AT DESC"
        rows = query_bq(sql)
        return {"status": "ok", "media": rows}

    except Exception as e:
        raise HTTPException(400, f"Erreur list media : {e}")


# ------------------------------------------------------------
# DELETE
# ------------------------------------------------------------
@router.delete("/delete/{media_id}")
def delete_media(media_id: str):
    """
    Supprime un média du registre (pas le fichier physique).
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


