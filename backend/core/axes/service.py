import uuid
from datetime import datetime

from utils.bigquery_utils import insert_bq, query_bq
from config import BQ_PROJECT, BQ_DATASET
from api.axes.models import AxeCreate, AxeUpdate

TABLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_AXE"


def create_axe(data: AxeCreate) -> str:
    axe_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_AXE": axe_id,
        "TYPE": data.type,
        "LABEL": data.label,
        "VISUEL_URL": data.visuel_url,
        "VISUEL_SQUARE_URL": data.visuel_square_url,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_AXE, row)
    return axe_id


def update_axe(id_axe: str, data: AxeUpdate):
    now = datetime.utcnow()

    row = [{
        "ID_AXE": id_axe,
        "TYPE": data.type,
        "LABEL": data.label,
        "VISUEL_URL": data.visuel_url,
        "VISUEL_SQUARE_URL": data.visuel_square_url,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_AXE, row)
    return True


def list_axes():
    sql = f"""
        SELECT *
        FROM `{TABLE_AXE}`
        ORDER BY LABEL ASC
    """
    return query_bq(sql)


def get_axe(id_axe: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_AXE}`
        WHERE ID_AXE = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": id_axe})
    return rows[0] if rows else None


def delete_axe(id_axe: str):
    query_bq(
        f"DELETE FROM `{TABLE_AXE}` WHERE ID_AXE = @id",
        {"id": id_axe}
    )
    return True
