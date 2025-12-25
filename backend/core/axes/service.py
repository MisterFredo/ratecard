# backend/core/axes/service.py

import uuid
from datetime import datetime
from backend.config import BQ_PROJECT, BQ_DATASET
from backend.utils.bigquery_utils import query_bq, insert_bq

TABLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_AXE"


def list_axes():
    sql = f"""
        SELECT *
        FROM `{TABLE_AXE}`
        ORDER BY TYPE ASC, LABEL ASC
    """
    return query_bq(sql)


def create_axe(type_: str, label: str):
    axe_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_AXE": axe_id,
        "TYPE": type_.upper(),
        "LABEL": label.strip(),
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_AXE, row)
    return axe_id


def delete_axe(axe_id: str):
    query_bq(
        f"DELETE FROM `{TABLE_AXE}` WHERE ID_AXE = @id",
        {"id": axe_id}
    )
    return True
