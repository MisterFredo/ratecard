# backend/api/media/by_entity.py

from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()
TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"


@router.get("/by-entity")
def by_entity(entity_type: str, entity_id: str):
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
