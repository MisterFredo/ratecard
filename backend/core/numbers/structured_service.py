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
    id_content: str,
    label: str,
    value: str,
    unit: str,
    context: str,
    topic_ids: List[str] = [],
):
    import uuid

    id_number = str(uuid.uuid4())
    now = _now()

    # ============================
    # INSERT NUMBER
    # ============================

    query_bq(f"""
        INSERT INTO `{TABLE}`
        (ID_NUMBER, ID_CONTENT, LABEL, VALUE, UNIT, CONTEXT, STATUS, CREATED_AT, UPDATED_AT)
        VALUES
        (@id_number, @id_content, @label, @value, @unit, @context, 'VALIDATED', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
    """, {
        "id_number": id_number,
        "id_content": id_content,
        "label": label,
        "value": float(value) if value not in (None, "", "null") else None,  # 🔥 FIX
        "unit": unit,
        "context": context,
    })

    # ============================
    # INSERT TOPICS (🔥 NEW)
    # ============================

    if topic_ids:

        rows = [
            {
                "ID_NUMBER": id_number,
                "ID_TOPIC": tid,
                "CREATED_AT": now,
            }
            for tid in set(topic_ids)
            if tid
        ]

        client = get_bigquery_client()

        client.load_table_from_json(
            rows,
            f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBER_TOPIC",
            job_config=bigquery.LoadJobConfig(
                write_disposition="WRITE_APPEND"
            ),
        ).result()

def get_topics_by_content(id_content: str):

    rows = query_bq(f"""
        SELECT ID_TOPIC
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC`
        WHERE ID_CONTENT = @id_content
    """, {
        "id_content": id_content
    })

    return [r["ID_TOPIC"] for r in rows]


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

    client = get_bigquery_client()

    query = f"""
        SELECT
            ID_CONTENT,
            CHIFFRES
        FROM `{TABLE_CONTENT}`
        WHERE CHIFFRES IS NOT NULL
        LIMIT {limit}
    """

    rows = client.query(query).result()

    results = []

    for row in rows:
        results.extend(parse_chiffres(dict(row)))

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
