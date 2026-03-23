import uuid
import json

from datetime import datetime, timezone
from typing import List, Dict, Optional
from google.cloud import bigquery
from openai import OpenAI

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, get_bigquery_client

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_STRUCTURED"


# ============================================================
# HELPERS
# ============================================================

def _now():
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# LIST PENDING
# ============================================================

def list_pending_numbers(limit: int = 200) -> List[Dict]:

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE STATUS = 'PENDING'
        ORDER BY CREATED_AT DESC
        LIMIT {limit}
    """)

    return [dict(r) for r in rows]

# ============================================================
# LIST BY STATUS
# ============================================================

def list_numbers_by_status(status: str, limit: int = 200) -> List[Dict]:

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE STATUS = @status
        ORDER BY CREATED_AT DESC
        LIMIT {limit}
    """, {
        "status": status,
    })

    return rows

# ============================================================
# CREATE STRUCTURED NUMBER
# ============================================================

def create_structured_number(
    id_content: Optional[str] = None
    source_id: Optional[str] = None

    label: str = None,
    value: str = None,
    unit: str = None,
    context: str = None,

    topic_labels: List[str] = None,
    topic_ids: List[str] = None,

    company_ids: List[str] = None,
    solution_ids: List[str] = None,
):
    import uuid

    id_number = str(uuid.uuid4())

    VIEW = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"

    TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBER_TOPIC"
    TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBER_COMPANY"
    TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBER_SOLUTION"

    # ============================================================
    # 0. VALIDATION MINIMALE
    # ============================================================

    if not id_content and not source_id:
        raise ValueError("id_content ou source_id obligatoire")

    # ============================================================
    # 1. INSERT NUMBER
    # ============================================================

    query_bq(f"""
        INSERT INTO `{TABLE}`
        (
            ID_NUMBER,
            ID_CONTENT,
            SOURCE_ID,
            LABEL,
            VALUE,
            UNIT,
            CONTEXT,
            STATUS,
            CREATED_AT,
            UPDATED_AT
        )
        VALUES
        (
            @id_number,
            @id_content,
            @source_id,
            @label,
            @value,
            @unit,
            @context,
            'VALIDATED',
            CURRENT_TIMESTAMP(),
            CURRENT_TIMESTAMP()
        )
    """, {
        "id_number": id_number,
        "id_content": id_content,
        "source_id": source_id,
        "label": label,
        "value": float(value) if value not in (None, "", "null") else None,
        "unit": unit,
        "context": context,
    })

    # ============================================================
    # 2. TOPICS (LOGIQUE EXISTANTE + SAFE)
    # ============================================================

    topics = []

    if id_content:

        rows = query_bq(f"""
            SELECT topics
            FROM `{VIEW}`
            WHERE id_content = @id_content
            LIMIT 1
        """, {
            "id_content": id_content
        })

        if rows:
            topics = rows[0].get("topics") or []

    # 🔥 priorité explicite
    if topic_ids:
        topics = [{"id_topic": tid} for tid in topic_ids]

    elif topic_labels:
        topics = [
            t for t in topics
            if t["label"] in topic_labels
        ]

    # ============================================================
    # 3. INSERT NUMBER → TOPIC
    # ============================================================

    if topics:

        rows_to_insert = [
            {
                "ID_NUMBER": id_number,
                "ID_TOPIC": t["id_topic"],
                "CREATED_AT": datetime.now(timezone.utc).isoformat(),
            }
            for t in topics
            if t.get("id_topic")
        ]

        if rows_to_insert:

            client = get_bigquery_client()

            client.load_table_from_json(
                rows_to_insert,
                TABLE_TOPIC,
                job_config=bigquery.LoadJobConfig(
                    write_disposition="WRITE_APPEND"
                ),
            ).result()

    # ============================================================
    # 4. INSERT NUMBER → COMPANY
    # ============================================================

    if company_ids:

        rows_to_insert = [
            {
                "ID_NUMBER": id_number,
                "ID_COMPANY": cid,
                "CREATED_AT": datetime.now(timezone.utc).isoformat(),
            }
            for cid in company_ids
        ]

        client = get_bigquery_client()

        client.load_table_from_json(
            rows_to_insert,
            TABLE_COMPANY,
            job_config=bigquery.LoadJobConfig(
                write_disposition="WRITE_APPEND"
            ),
        ).result()

    # ============================================================
    # 5. INSERT NUMBER → SOLUTION
    # ============================================================

    if solution_ids:

        rows_to_insert = [
            {
                "ID_NUMBER": id_number,
                "ID_SOLUTION": sid,
                "CREATED_AT": datetime.now(timezone.utc).isoformat(),
            }
            for sid in solution_ids
        ]

        client = get_bigquery_client()

        client.load_table_from_json(
            rows_to_insert,
            TABLE_SOLUTION,
            job_config=bigquery.LoadJobConfig(
                write_disposition="WRITE_APPEND"
            ),
        ).result()

    # ============================================================

    return id_number


# ============================================================
# UPDATE ONE (EDIT / VALIDATE / REJECT)
# ============================================================

def update_structured_number(
    id_number: str,
    label: Optional[str] = None,
    value: Optional[float] = None,
    unit: Optional[str] = None,
    context: Optional[str] = None,
    status: Optional[str] = None,
):

    updates = []
    params = {
        "id_number": id_number,
    }

    if label is not None:
        updates.append("LABEL = @label")
        params["label"] = label

    if value is not None:
        updates.append("VALUE = @value")
        params["value"] = value

    if unit is not None:
        updates.append("UNIT = @unit")
        params["unit"] = unit

    if context is not None:
        updates.append("CONTEXT = @context")
        params["context"] = context

    if status is not None:
        updates.append("STATUS = @status")
        params["status"] = status

    if not updates:
        return

    updates.append("UPDATED_AT = CURRENT_TIMESTAMP()")

    query_bq(f"""
        UPDATE `{TABLE}`
        SET {", ".join(updates)}
        WHERE ID_NUMBER = @id_number
    """, params)


# ============================================================
# BULK VALIDATE
# ============================================================

def bulk_validate_numbers(ids: List[str]):

    if not ids:
        return

    query_bq(f"""
        UPDATE `{TABLE}`
        SET
            STATUS = 'VALIDATED',
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_NUMBER IN UNNEST(@ids)
    """, {
        "ids": ids
    })


# ============================================================
# BULK REJECT
# ============================================================

def bulk_reject_numbers(ids: List[str]):

    if not ids:
        return

    query_bq(f"""
        UPDATE `{TABLE}`
        SET
            STATUS = 'REJECTED',
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_NUMBER IN UNNEST(@ids)
    """, {
        "ids": ids
    })


# ============================================================
# DELETE ONE
# ============================================================

def delete_structured_number(id_number: str):

    query_bq(f"""
        DELETE FROM `{TABLE}`
        WHERE ID_NUMBER = @id_number
    """, {
        "id_number": id_number
    })


# ============================================================
# STATS (ADMIN VIEW)
# ============================================================

def get_numbers_stats() -> List[Dict]:

    rows = query_bq(f"""
        SELECT
            LABEL,
            UNIT,
            COUNT(*) AS occurrences,
            COUNTIF(STATUS = 'PENDING') AS pending,
            COUNTIF(STATUS = 'VALIDATED') AS validated,
            COUNTIF(STATUS = 'REJECTED') AS rejected
        FROM `{TABLE}`
        GROUP BY LABEL, UNIT
        ORDER BY occurrences DESC
        LIMIT 200
    """)

    return rows

# ============================================================
# RAW NUMBERS FROM CONTENT
# ============================================================

def parse_chiffres(row):

    raw = row.get("CHIFFRES")

    if not raw:
        return []

    if isinstance(raw, list):
        raw = "\n".join(raw)

    if not isinstance(raw, str):
        return []

    lines = [l.strip() for l in raw.split("\n") if l.strip()]

    results = []

    for line in lines:

        # 🔥 split robuste
        parts = [p.strip() for p in line.split("|")]

        # 🔥 sécurité
        if len(parts) < 4:
            continue

        # 🔥 prendre les 4 premiers seulement
        label, value, unit, context = parts[:4]

        results.append({
            "id_content": row["ID_CONTENT"],
            "label": label,
            "value": value,
            "unit": unit,
            "context": context,
        })

    return results

def get_raw_numbers(limit: int = 500):

    TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
    TABLE_STRUCTURED = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_STRUCTURED"
    VIEW = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"

    rows = query_bq(f"""
        WITH raw AS (

            SELECT
                c.ID_CONTENT AS id_content,
                chiffre,
                v.topics
            FROM `{TABLE_CONTENT}` c
            JOIN `{VIEW}` v
              ON c.ID_CONTENT = v.id_content,
            UNNEST(c.CHIFFRES) AS chiffre
            WHERE chiffre IS NOT NULL

        ),

        parsed AS (

            SELECT
                id_content,
                chiffre,
                SPLIT(chiffre, '|') AS parts,
                topics
            FROM raw
            WHERE ARRAY_LENGTH(SPLIT(chiffre, '|')) = 4

        ),

        cleaned AS (

            SELECT
                id_content,
                TRIM(parts[OFFSET(0)]) AS label,
                TRIM(parts[OFFSET(1)]) AS value,
                TRIM(parts[OFFSET(2)]) AS unit,
                TRIM(parts[OFFSET(3)]) AS context,
                topics
            FROM parsed

        )

        SELECT *
        FROM cleaned c

        WHERE NOT EXISTS (

            SELECT 1
            FROM `{TABLE_STRUCTURED}` s
            WHERE s.ID_CONTENT = c.id_content
              AND s.LABEL = c.label
              AND CAST(s.VALUE AS STRING) = c.value
              AND s.UNIT = c.unit
              AND s.CONTEXT = c.context

        )

        LIMIT @limit
    """, {
        "limit": limit
    })

    results = []

    for r in rows:

        topics = [
            {
                "label": t["label"],
                "checked": True,
            }
            for t in (r.get("topics") or [])
        ]

        results.append({
            "id_content": r["id_content"],
            "label": r["label"],
            "value": r["value"],
            "unit": r["unit"],
            "context": r["context"],
            "topics": topics,
        })

    return results
# ============================================================
# FETCH VALIDATED (POUR INSIGHTS)
# ============================================================

def get_validated_numbers(
    entity_type: str,
    entity_id: str,
    year: int,
    period: Optional[int] = None,
    frequency: Optional[str] = None,
) -> List[Dict]:

    VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"

    where_entity = "FALSE"

    if entity_type == "topic":
        where_entity = """
        EXISTS (
            SELECT 1 FROM UNNEST(c.topics) t
            WHERE t.id_topic = @entity_id
        )
        """

    elif entity_type == "company":
        where_entity = """
        EXISTS (
            SELECT 1 FROM UNNEST(c.companies) comp
            WHERE comp.id_company = @entity_id
        )
        """

    elif entity_type == "solution":
        where_entity = """
        EXISTS (
            SELECT 1 FROM UNNEST(c.solutions) s
            WHERE s.id_solution = @entity_id
        )
        """

    date_filter = "TRUE"

    if period and frequency == "WEEKLY":
        date_filter = "EXTRACT(ISOWEEK FROM c.published_at) = @period"
    elif period and frequency == "MONTHLY":
        date_filter = "EXTRACT(MONTH FROM c.published_at) = @period"
    elif period and frequency == "QUARTERLY":
        date_filter = "EXTRACT(QUARTER FROM c.published_at) = @period"

    params = {
        "entity_id": entity_id,
        "year": year,
    }

    if period:
        params["period"] = period

    rows = query_bq(f"""
        SELECT
            n.LABEL,
            n.VALUE,
            n.UNIT,
            n.CONTEXT
        FROM `{TABLE}` n
        JOIN `{VIEW_CONTENT}` c
          ON n.ID_CONTENT = c.ID_CONTENT
        WHERE n.STATUS = 'VALIDATED'
        AND {where_entity}
        AND EXTRACT(YEAR FROM c.published_at) = @year
        AND {date_filter}
    """, params)

    return rows
