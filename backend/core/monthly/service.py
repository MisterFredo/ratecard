import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client

from core.monthly.model import (
    MonthlyInsightInput,
)

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MONTHLY"


# ============================================================
# HELPERS
# ============================================================

def _now():
    return datetime.now(timezone.utc).isoformat()


def _map_row(r: Dict) -> Dict:
    return {
        "id_insight": r.get("ID_INSIGHT"),
        "entity_type": r.get("ENTITY_TYPE"),
        "entity_id": r.get("ENTITY_ID"),
        "year": r.get("YEAR"),
        "month": r.get("MONTH"),
        "title": r.get("TITLE"),
        "key_points": r.get("KEY_POINTS") or [],
        "status": r.get("STATUS"),
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# CREATE
# ============================================================

def create_monthly_insight(data: MonthlyInsightInput) -> str:

    insight_id = str(uuid.uuid4())
    now = _now()

    row = [{
        "ID_INSIGHT": insight_id,
        "ENTITY_TYPE": data.entity_type,
        "ENTITY_ID": data.entity_id,
        "YEAR": data.year,
        "MONTH": data.month,
        "TITLE": data.title,
        "KEY_POINTS": data.key_points or [],
        "STATUS": data.status or "DRAFT",
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE, row)

    return insight_id


# ============================================================
# GET ONE
# ============================================================

def get_monthly_insight(
    entity_type: str,
    entity_id: str,
    year: int,
    month: int,
) -> Optional[Dict]:

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND MONTH = @month
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "month": month,
    })

    return _map_row(rows[0]) if rows else None


# ============================================================
# LIST (TIMELINE)
# ============================================================

def list_monthly_insights(
    entity_type: str,
    entity_id: str,
) -> List[Dict]:

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        ORDER BY YEAR DESC, MONTH DESC
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
    })

    return [_map_row(r) for r in rows]


# ============================================================
# UPDATE
# ============================================================

def update_monthly_insight(
    insight_id: str,
    data: Dict
):

    client = get_bigquery_client()

    query = f"""
        UPDATE `{TABLE}`
        SET
            TITLE = @title,
            KEY_POINTS = @key_points,
            STATUS = @status,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_INSIGHT = @insight_id
    """

    job_config = {
        "query_parameters": [
            {
                "name": "insight_id",
                "parameterType": {"type": "STRING"},
                "parameterValue": {"value": insight_id},
            },
            {
                "name": "title",
                "parameterType": {"type": "STRING"},
                "parameterValue": {"value": data.get("title")},
            },
            {
                "name": "key_points",
                "parameterType": {
                    "type": "ARRAY",
                    "arrayType": {"type": "STRING"},
                },
                "parameterValue": {
                    "arrayValues": [
                        {"value": v} for v in data.get("key_points", [])
                    ]
                },
            },
            {
                "name": "status",
                "parameterType": {"type": "STRING"},
                "parameterValue": {"value": data.get("status", "DRAFT")},
            },
        ]
    }

    client.query(query, job_config=job_config).result()


# ============================================================
# DELETE
# ============================================================

def delete_monthly_insight(insight_id: str):

    query_bq(f"""
        DELETE FROM `{TABLE}`
        WHERE ID_INSIGHT = @insight_id
    """, {
        "insight_id": insight_id
    })


# ============================================================
# CHECK EXISTING (clé pour génération)
# ============================================================

def monthly_insight_exists(
    entity_type: str,
    entity_id: str,
    year: int,
    month: int,
) -> bool:

    rows = query_bq(f"""
        SELECT 1
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND MONTH = @month
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "month": month,
    })

    return len(rows) > 0
