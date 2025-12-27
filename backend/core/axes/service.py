# backend/core/axes/service.py

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
        "LABEL": data.label,
        "DESCRIPTION": data.description,
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,
        "MEDIA_SQUARE_ID": data.media_square_id,
        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    insert_bq(TABLE_AXE, row)
    return axe_id


def update_axe(id_axe: str, data: AxeUpdate):
    now = datetime.utcnow()

    # PATCH-like construction
    updates = {k.upper(): v for k, v in data.dict(exclude_unset=True).items()}
    updates["ID_AXE"] = id_axe
    updates["UPDATED_AT"] = now

    insert_bq(TABLE_AXE, [updates])
    return True


def list_axes():
    sql = f"""
        SELECT *
        FROM `{TABLE_AXE}`
        WHERE IS_ACTIVE = TRUE
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
    sql = f"""
        UPDATE `{TABLE_AXE}`
        SET IS_ACTIVE = FALSE,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_AXE = @id
    """
    query_bq(sql, {"id": id_axe})
    return True
