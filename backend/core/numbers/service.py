# backend/core/numbers/service.py

import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, get_bigquery_client


TABLE_NUMBERS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS"

TABLE_NUMBERS_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_COMPANY"
TABLE_NUMBERS_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_TOPIC"
TABLE_NUMBERS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_SOLUTION"


# ============================================================
# HELPERS
# ============================================================

def _now():
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# PARSE CHIFFRES (FROM CONTENT)
# ============================================================

def parse_chiffres(chiffres: List[str]) -> List[Dict]:

    results = []

    for line in chiffres:

        if not line or "|" not in line:
            continue

        parts = [p.strip() for p in line.split("|")]

        if len(parts) != 6:
            continue

        label, value, unit, actor, market, period = parts

        try:
            value = float(value)
        except:
            continue

        results.append({
            "label": label,
            "value": value,
            "unit": unit,
            "actor": actor,
            "zone": market,
            "period": period,
        })

    return results


# ============================================================
# CREATE NUMBER
# ============================================================

def create_number(
    value: float,
    unit: str,
    id_number_type: str,
    zone: str,
    period: str,
    source_id: str,
    type_news: str,

    company_ids: Optional[List[str]] = None,
    topic_ids: Optional[List[str]] = None,
    solution_ids: Optional[List[str]] = None,
) -> str:

    id_number = str(uuid.uuid4())

    row = [{
        "ID_NUMBER": id_number,
        "VALUE": value,
        "UNIT": unit,
        "ID_NUMBER_TYPE": id_number_type,
        "ZONE": zone,
        "PERIOD": period,
        "SOURCE_ID": source_id,
        "TYPE_NEWS": type_news,
        "CREATED_AT": _now(),
    }]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        TABLE_NUMBERS,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    # ============================================================
    # RELATIONS
    # ============================================================

    _insert_relations(
        id_number,
        company_ids=company_ids,
        topic_ids=topic_ids,
        solution_ids=solution_ids
    )

    return id_number


# ============================================================
# RELATIONS
# ============================================================

def _insert_relations(
    id_number: str,
    company_ids: Optional[List[str]],
    topic_ids: Optional[List[str]],
    solution_ids: Optional[List[str]],
):

    client = get_bigquery_client()

    # ---------------- COMPANY ----------------
    if company_ids:
        rows = [{
            "ID_NUMBER": id_number,
            "ID_COMPANY": cid,
            "CREATED_AT": _now(),
        } for cid in company_ids]

        client.load_table_from_json(
            rows,
            TABLE_NUMBERS_COMPANY,
            job_config=bigquery.LoadJobConfig(
                write_disposition="WRITE_APPEND"
            ),
        ).result()

    # ---------------- TOPIC ----------------
    if topic_ids:
        rows = [{
            "ID_NUMBER": id_number,
            "ID_TOPIC": tid,
            "CREATED_AT": _now(),
        } for tid in topic_ids]

        client.load_table_from_json(
            rows,
            TABLE_NUMBERS_TOPIC,
            job_config=bigquery.LoadJobConfig(
                write_disposition="WRITE_APPEND"
            ),
        ).result()

    # ---------------- SOLUTION ----------------
    if solution_ids:
        rows = [{
            "ID_NUMBER": id_number,
            "ID_SOLUTION": sid,
            "CREATED_AT": _now(),
        } for sid in solution_ids]

        client.load_table_from_json(
            rows,
            TABLE_NUMBERS_SOLUTION,
            job_config=bigquery.LoadJobConfig(
                write_disposition="WRITE_APPEND"
            ),
        ).result()


# ============================================================
# LIST
# ============================================================

def list_numbers(limit: int = 100):

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE_NUMBERS}`
        ORDER BY CREATED_AT DESC
        LIMIT @limit
    """, {
        "limit": limit
    })

    return rows


# ============================================================
# DELETE
# ============================================================

def delete_number(id_number: str):

    query_bq(f"""
        DELETE FROM `{TABLE_NUMBERS}`
        WHERE ID_NUMBER = @id_number
    """, {
        "id_number": id_number
    })
