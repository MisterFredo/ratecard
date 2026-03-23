from typing import List, Dict, Optional
from datetime import datetime, timezone

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, get_bigquery_client

from google.cloud import bigquery


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
        LIMIT @limit
    """, {
        "limit": limit
    })

    return rows


# ============================================================
# LIST BY STATUS
# ============================================================

def list_numbers_by_status(status: str, limit: int = 200) -> List[Dict]:

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE STATUS = @status
        ORDER BY CREATED_AT DESC
        LIMIT @limit
    """, {
        "status": status,
        "limit": limit
    })

    return rows


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
