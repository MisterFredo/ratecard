# backend/api/media/assign.py

from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import query_bq, get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"


@router.post("/assign")
def assign_media(media_id: str, entity_type: str, entity_id: str):
    """
    Assigne un média (ID_MEDIA) à une entité:
    - entity_type = axe | company | person | article
    - entity_id = ID_AXE, ID_COMPANY, etc.
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
            job_config=None,
            parameters=[
                {"name": "etype", "parameterType": {"type": "STRING"}, "parameterValue": {"value": entity_type}},
                {"name": "eid", "parameterType": {"type": "STRING"}, "parameterValue": {"value": entity_id}},
                {"name": "mid", "parameterType": {"type": "STRING"}, "parameterValue": {"value": media_id}},
            ]
        )

        return {"status": "ok", "assigned": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur assignation media : {e}")
