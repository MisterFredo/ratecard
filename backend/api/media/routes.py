# backend/api/media/routes.py

from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from datetime import datetime
from uuid import uuid4
from config import BQ_PROJECT, BQ_DATASET

# ⬅️ IMPORT DES MODELES !
from api.media.models import MediaRegister, MediaAssign, MediaUnassign

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
            "CREATED_AT": now,
        }]

        insert_bq(TABLE, row)

        return {"status": "ok", "media_id": media_id}

    except Exception as e:
        raise HTTPException(400, f"Erreur register media : {e}")


# ------------------------------------------------------------
# ASSIGN
# ------------------------------------------------------------
@router.post("/assign")
def assign_media(payload: MediaAssign):
    """
    Associe un média à une entité (axe, company, person, article).
    """
    try:
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE}`
            SET ENTITY_TYPE = @etype,
                ENTITY_ID = @eid
            WHERE ID_MEDIA = @mid
        """

        client.query(
            sql,
            parameters=[
                {
                    "name": "etype",
                    "parameterType": {"type": "STRING"},
                    "parameterValue": {"value": payload.entity_type},
                },
                {
                    "name": "eid",
                    "parameterType": {"type": "STRING"},
                    "parameterValue": {"value": payload.entity_id},
                },
                {
                    "name": "mid",
                    "parameterType": {"type": "STRING"},
                    "parameterValue": {"value": payload.media_id},
                },
            ]
        )

        return {"status": "ok", "assigned": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur assign media : {e}")


# ------------------------------------------------------------
# UNASSIGN
# ------------------------------------------------------------
@router.post("/unassign")
def unassign_media(payload: MediaUnassign):
    """
    Détache un média de son entité (sans le supprimer).
    """
    try:
        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE}`
            SET ENTITY_TYPE = NULL,
                ENTITY_ID = NULL
            WHERE ID_MEDIA = @mid
        """

        client.query(
            sql,
            parameters=[
                {
                    "name": "mid",
                    "parameterType": {"type": "STRING"},
                    "parameterValue": {"value": payload.media_id},
                },
            ]
        )

        return {"status": "ok", "unassigned": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur unassign media : {e}")


# ------------------------------------------------------------
# BY ENTITY
# ------------------------------------------------------------
@router.get("/by-entity")
def get_by_entity(entity_type: str, entity_id: str):
    """
    Retourne tous les médias rattachés à une entité.
    """
    try:
        sql = f"""
            SELECT *
            FROM `{TABLE}`
            WHERE ENTITY_TYPE = @etype
              AND ENTITY_ID = @eid
            ORDER BY CREATED_AT DESC
        """
        rows = query_bq(sql, {"etype": entity_type, "eid": entity_id})
        return {"status": "ok", "media": rows}

    except Exception as e:
        raise HTTPException(400, f"Erreur by-entity : {e}")


# ------------------------------------------------------------
# LIST
# ------------------------------------------------------------
@router.get("/list")
def list_media():
    """
    Retourne tous les médias avec toutes leurs métadonnées BQ.
    (Le frontend Next.js ne gère plus BigQuery)
    """
    try:
        sql = f"""
            SELECT *
            FROM `{TABLE}`
            ORDER BY CREATED_AT DESC
        """
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
    Supprime la ligne BigQuery (le fichier physique est supprimé par Next.js).
    """
    try:
        client = get_bigquery_client()
        sql = f"DELETE FROM `{TABLE}` WHERE ID_MEDIA = @mid"

        client.query(
            sql,
            parameters=[
                {
                    "name": "mid",
                    "parameterType": {"type": "STRING"},
                    "parameterValue": {"value": media_id},
                },
            ]
        )

        return {"status": "ok", "deleted": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur delete media : {e}")

