# backend/api/media/delete.py

from fastapi import APIRouter, HTTPException
from utils.bigquery_utils import get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()
TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"


@router.delete("/delete/{media_id}")
def delete_media(media_id: str):
    try:
        client = get_bigquery_client()
        sql = f"DELETE FROM `{TABLE}` WHERE ID_MEDIA = @mid"

        client.query(
            sql,
            parameters=[
                {"name": "mid", "parameterType": {"type": "STRING"}, "parameterValue": {"value": media_id}},
            ]
        )

        return {"status": "ok", "deleted": True}

    except Exception as e:
        raise HTTPException(400, f"Erreur delete media : {e}")
