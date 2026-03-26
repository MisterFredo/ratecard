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
TABLE_NUMBERS_TYPES = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_TYPES"


# ============================================================
# HELPERS
# ============================================================

def _now():
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_number_payload(data: Dict) -> Dict:

    value = data.get("value")
    unit = (data.get("unit") or "").strip()
    zone = (data.get("zone") or "").strip().upper()
    period = (data.get("period") or "").strip()

    try:
        value = float(value)
    except:
        value = None

    return {
        "value": value,
        "unit": unit,
        "id_number_type": data.get("id_number_type"),
        "zone": zone,
        "period": period,
        "source_id": data.get("source_id"),
        "company_ids": data.get("company_ids") or [],
        "topic_ids": data.get("topic_ids") or [],
        "solution_ids": data.get("solution_ids") or [],
    }


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
            "actor": actor,   # UI only
            "zone": market,
            "period": period,
        })

    return results


# ============================================================
# GET NUMBERS FROM CONTENT (FLOW GUIDÉ)
# ============================================================

def get_numbers_from_content(id_content: str):

    TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

    rows = query_bq(f"""
        SELECT CHIFFRES
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT = @id_content
        LIMIT 1
    """, {
        "id_content": id_content
    })

    if not rows:
        return []

    chiffres = rows[0].get("CHIFFRES") or []

    return parse_chiffres(chiffres)


# ============================================================
# BASIC QUALITY CHECK (NON BLOQUANT)
# ============================================================

def check_basic_quality(
    value: float,
    id_number_type: str,
    zone: str,
    period: str,
    company_ids: Optional[List[str]] = None,
):

    if value is None:
        return {"status": "invalid_value"}

    if value <= 0:
        return {"status": "warning", "reason": "value <= 0"}

    # --- duplicate simple ---
    if company_ids:

        rows = query_bq(f"""
            SELECT 1
            FROM `{TABLE_NUMBERS}` n
            JOIN `{TABLE_NUMBERS_COMPANY}` c
              ON n.ID_NUMBER = c.ID_NUMBER
            WHERE c.ID_COMPANY IN UNNEST(@company_ids)
            AND n.VALUE = @value
            AND n.ID_NUMBER_TYPE = @type
            AND n.ZONE = @zone
            AND n.PERIOD = @period
            LIMIT 1
        """, {
            "company_ids": company_ids,
            "value": value,
            "type": id_number_type,
            "zone": zone,
            "period": period,
        })

        if rows:
            return {"status": "duplicate"}

    return {"status": "ok"}


# ============================================================
# COHERENCE CHECK (LIGHT)
# ============================================================

def check_number_coherence(
    value: float,
    id_number_type: str,
    zone: str,
    period: str,
    company_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    solution_id: Optional[str] = None,
):

    if not (company_id or topic_id or solution_id):
        return {"status": "no_entity"}

    if company_id:
        join = f"JOIN `{TABLE_NUMBERS_COMPANY}` rel ON n.ID_NUMBER = rel.ID_NUMBER"
        condition = "rel.ID_COMPANY = @entity_id"

    elif topic_id:
        join = f"JOIN `{TABLE_NUMBERS_TOPIC}` rel ON n.ID_NUMBER = rel.ID_NUMBER"
        condition = "rel.ID_TOPIC = @entity_id"

    else:
        join = f"JOIN `{TABLE_NUMBERS_SOLUTION}` rel ON n.ID_NUMBER = rel.ID_NUMBER"
        condition = "rel.ID_SOLUTION = @entity_id"

    rows = query_bq(f"""
        SELECT n.VALUE
        FROM `{TABLE_NUMBERS}` n
        {join}
        WHERE {condition}
        AND n.ID_NUMBER_TYPE = @type_id
        AND n.ZONE = @zone
        AND n.PERIOD = @period
    """, {
        "entity_id": company_id or topic_id or solution_id,
        "type_id": id_number_type,
        "zone": zone,
        "period": period,
    })

    values = [r["VALUE"] for r in rows if r.get("VALUE") is not None]

    if len(values) < 2:
        return {"status": "no_baseline"}

    min_v = min(values)
    max_v = max(values)

    if min_v == 0:
        return {"status": "invalid_baseline"}

    ratio = max_v / min_v

    if ratio > 2:
        return {"status": "high_inconsistency", "ratio": ratio}

    elif ratio > 1.3:
        return {"status": "medium_inconsistency", "ratio": ratio}

    return {"status": "ok", "ratio": ratio}


# ============================================================
# CREATE NUMBER (MANUEL + GUIDÉ)
# ============================================================

def create_number(data: Dict) -> Dict:

    payload = normalize_number_payload(data)

    # --- quality check ---
    quality = check_basic_quality(
        value=payload["value"],
        id_number_type=payload["id_number_type"],
        zone=payload["zone"],
        period=payload["period"],
        company_ids=payload["company_ids"],
    )

    # --- insert ---
    id_number = str(uuid.uuid4())

    row = [{
        "ID_NUMBER": id_number,
        "VALUE": payload["value"],
        "UNIT": payload["unit"],
        "ID_NUMBER_TYPE": payload["id_number_type"],
        "ZONE": payload["zone"],
        "PERIOD": payload["period"],
        "SOURCE_ID": payload["source_id"],
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

    # --- relations ---
    _insert_relations(
        id_number,
        payload["company_ids"],
        payload["topic_ids"],
        payload["solution_ids"]
    )

    return {
        "id_number": id_number,
        "quality": quality
    }


# ============================================================
# RELATIONS
# ============================================================

def _insert_relations(id_number, company_ids, topic_ids, solution_ids):

    client = get_bigquery_client()

    if company_ids:
        rows = [{
            "ID_NUMBER": id_number,
            "ID_COMPANY": cid,
            "CREATED_AT": _now(),
        } for cid in company_ids]

        client.load_table_from_json(rows, TABLE_NUMBERS_COMPANY).result()

    if topic_ids:
        rows = [{
            "ID_NUMBER": id_number,
            "ID_TOPIC": tid,
            "CREATED_AT": _now(),
        } for tid in topic_ids]

        client.load_table_from_json(rows, TABLE_NUMBERS_TOPIC).result()

    if solution_ids:
        rows = [{
            "ID_NUMBER": id_number,
            "ID_SOLUTION": sid,
            "CREATED_AT": _now(),
        } for sid in solution_ids]

        client.load_table_from_json(rows, TABLE_NUMBERS_SOLUTION).result()


# ============================================================
# LIST
# ============================================================

def list_numbers(limit: int = 100):

    return query_bq(f"""
        SELECT *
        FROM `{TABLE_NUMBERS}`
        ORDER BY CREATED_AT DESC
        LIMIT @limit
    """, {"limit": limit})


# ============================================================
# DELETE
# ============================================================

def delete_number(id_number: str):

    query_bq(f"""
        DELETE FROM `{TABLE_NUMBERS}`
        WHERE ID_NUMBER = @id_number
    """, {"id_number": id_number})

def get_raw_numbers(limit: int = 200):

    TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

    rows = query_bq(f"""
        SELECT ID_CONTENT, CHIFFRES
        FROM `{TABLE_CONTENT}`
        WHERE CHIFFRES IS NOT NULL
        LIMIT @limit
    """, {
        "limit": limit
    })

    results = []

    for r in rows:

        chiffres = r.get("CHIFFRES") or []

        if isinstance(chiffres, str):
            chiffres = chiffres.split("\n")

        for line in chiffres:

            parts = [p.strip() for p in line.split("|")]

            if len(parts) != 6:
                continue

            label, value, unit, actor, market, period = parts

            try:
                value = float(value)
            except:
                continue

            results.append({
                "id_content": r["ID_CONTENT"],
                "label": label,
                "value": value,
                "unit": unit,
                "actor": actor,
                "market": market,
                "period": period,
            })

    return results

def get_number_types():

    TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_TYPES"

    rows = query_bq(f"""
        SELECT ID_NUMBER_TYPE, LABEL
        FROM `{TABLE}`
        ORDER BY LABEL
    """)

    return [
        {
            "id_number_type": r["ID_NUMBER_TYPE"],
            "label": r["LABEL"],
        }
        for r in rows
    ]
