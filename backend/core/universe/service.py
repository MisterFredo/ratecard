import uuid
from datetime import datetime

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)

TABLE_UNIVERSE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_UNIVERSE"


# ============================================================
# LIST
# ============================================================

def list_universes():

    sql = f"""
        SELECT
            ID_UNIVERSE,
            LABEL,
            DESCRIPTION,
            CREATED_AT
        FROM `{TABLE_RATECARD_UNIVERSE}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY LABEL ASC
    """

    rows = query_bq(sql)

    return [
        {
            "id_universe": r["ID_UNIVERSE"],
            "label": r["LABEL"],
            "description": r.get("DESCRIPTION"),
            "created_at": r.get("CREATED_AT"),
        }
        for r in rows
    ]


# ============================================================
# GET ONE
# ============================================================

def get_universe(universe_id: str):

    sql = f"""
        SELECT
            ID_UNIVERSE,
            LABEL,
            DESCRIPTION,
            CREATED_AT
        FROM `{TABLE_RATECARD_UNIVERSE}`
        WHERE ID_UNIVERSE = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": universe_id})

    if not rows:
        return None

    r = rows[0]

    return {
        "id_universe": r["ID_UNIVERSE"],
        "label": r["LABEL"],
        "description": r.get("DESCRIPTION"),
        "created_at": r.get("CREATED_AT"),
    }
