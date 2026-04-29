import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, get_bigquery_client

from core.numbers.parsing import (
    parse_chiffres,
    get_raw_numbers,
    get_numbers_from_content,
)

from core.numbers.quality import (
    check_basic_quality,
    check_number_coherence,
)

from core.numbers.search import (
    search_numbers_service
    get_numbers_feed_service
    get_numbers_for_entity
)

from core.numbers.create import (
    create_number
)

TABLE_NUMBERS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS"

TABLE_NUMBERS_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_COMPANY"
TABLE_NUMBERS_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_TOPIC"
TABLE_NUMBERS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_SOLUTION"
TABLE_NUMBERS_TYPES = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_TYPE"
VIEW_NUMBERS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NUMBERS_ENRICHED"
VIEW_NUMBERS_CARDS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NUMBERS_CARDS"

# ============================================================
# ORDER (UX métier)
# ============================================================

CATEGORY_ORDER = [
    "VALUE",
    "PERFORMANCE",
    "AUDIENCE",
    "POSITION",
    "DYNAMICS",
    "STRUCTURE",
    "MONETIZATION",
]


# ============================================================
# HELPERS
# ============================================================

def _now():
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# NORMALIZATION
# ============================================================

def _extract_unit_scale(unit_raw: str):
    u = (unit_raw or "").lower()

    if "%" in u:
        return "PERCENT", None
    if "€" in u or "eur" in u:
        if "billion" in u or "milliard" in u:
            return "EUR", "billion"
        if "million" in u:
            return "EUR", "million"
        if "thousand" in u or "k" in u:
            return "EUR", "thousand"
        return "EUR", None

    return unit_raw.upper() if unit_raw else None, None


def normalize_number_payload(data: Dict) -> Dict:

    value = data.get("value")
    zone = (data.get("zone") or "").strip().upper()
    period = (data.get("period") or "").strip()

    try:
        value = float(value)
    except:
        value = None

    unit_raw = data.get("unit")
    unit, scale = _extract_unit_scale(unit_raw)

    return {
        "label": data.get("label"),
        "value": value,
        "unit": unit,
        "scale": data.get("scale") or scale,
        "id_number_type": data.get("id_number_type"),
        "zone": zone,
        "period": period,
        "source_id": data.get("source_id"),
        "confidence": data.get("confidence"),
        "notes": data.get("notes"),
        "company_ids": data.get("company_ids") or [],
        "topic_ids": data.get("topic_ids") or [],
        "solution_ids": data.get("solution_ids") or [],
    }

# ============================================================
# MATCH EXISTING NUMBERS
# ============================================================

def find_existing_numbers(
    id_number_type: str,
    zone: str,
    period: str,
    company_ids: Optional[List[str]] = None,
    topic_ids: Optional[List[str]] = None,
    solution_ids: Optional[List[str]] = None,
) -> List[Dict]:

    if not (company_ids or topic_ids or solution_ids):
        return []

    if company_ids:
        join = f"JOIN `{TABLE_NUMBERS_COMPANY}` rel ON n.ID_NUMBER = rel.ID_NUMBER"
        condition = "rel.ID_COMPANY IN UNNEST(@entity_ids)"
        entity_ids = company_ids

    elif topic_ids:
        join = f"JOIN `{TABLE_NUMBERS_TOPIC}` rel ON n.ID_NUMBER = rel.ID_NUMBER"
        condition = "rel.ID_TOPIC IN UNNEST(@entity_ids)"
        entity_ids = topic_ids

    else:
        join = f"JOIN `{TABLE_NUMBERS_SOLUTION}` rel ON n.ID_NUMBER = rel.ID_NUMBER"
        condition = "rel.ID_SOLUTION IN UNNEST(@entity_ids)"
        entity_ids = solution_ids

    rows = query_bq(f"""
        SELECT
            n.ID_NUMBER,
            n.LABEL,
            n.VALUE,
            n.SCALE,
            n.UNIT
        FROM `{TABLE_NUMBERS}` n
        {join}
        WHERE {condition}
        AND n.ID_NUMBER_TYPE = @type_id
        AND n.ZONE = @zone
        AND n.PERIOD = @period
        LIMIT 20
    """, {
        "entity_ids": entity_ids,
        "type_id": id_number_type,
        "zone": zone,
        "period": period,
    })

    return rows



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

def list_numbers(limit: int = 400):

    return query_bq(f"""
        SELECT *
        FROM `{TABLE_NUMBERS}`
        ORDER BY CREATED_AT DESC
        LIMIT @limit
    """, {"limit": limit})


# ============================================================
# DELETE
# ============================================================

def delete_number_relations(id_number: str):

    query_bq(f"""
        DELETE FROM `{TABLE_NUMBERS_COMPANY}`
        WHERE ID_NUMBER = @id_number
    """, {"id_number": id_number})

    query_bq(f"""
        DELETE FROM `{TABLE_NUMBERS_TOPIC}`
        WHERE ID_NUMBER = @id_number
    """, {"id_number": id_number})

    query_bq(f"""
        DELETE FROM `{TABLE_NUMBERS_SOLUTION}`
        WHERE ID_NUMBER = @id_number
    """, {"id_number": id_number})


def delete_number(id_number: str):

    query_bq(f"""
        DELETE FROM `{TABLE_NUMBERS}`
        WHERE ID_NUMBER = @id_number
    """, {"id_number": id_number})


# ============================================================
# TYPES
# ============================================================

def get_number_types():

    rows = query_bq(f"""
        SELECT ID_TYPE, TYPE
        FROM `{TABLE_NUMBERS_TYPES}`
        WHERE IS_ACTIVE IS TRUE OR IS_ACTIVE IS NULL
        ORDER BY TYPE
    """)

    return [
        {
            "id": r["ID_TYPE"],
            "label": r["TYPE"],
        }
        for r in rows
    ]

def get_numbers_for_entity(
    entity_type: str,
    entity_id: str,
    limit: Optional[int] = None
) -> List[Dict]:

    sql = f"""
        SELECT
            ID_NUMBER,
            LABEL,
            VALUE,
            UNIT,
            SCALE,
            TYPE,
            CATEGORY,
            ZONE,
            PERIOD,
            CREATED_AT
        FROM `{VIEW_NUMBERS}`
        WHERE ENTITY_TYPE = @entity_type
          AND ENTITY_ID = @entity_id
        ORDER BY
            CATEGORY,
            TYPE,
            PERIOD DESC
    """

    rows = query_bq(sql, {
        "entity_type": entity_type,
        "entity_id": entity_id
    })

    # ============================================================
    # LIMIT (preview)
    # ============================================================

    if limit is not None:
        rows = rows[:limit]

    # ============================================================
    # GROUPING
    # ============================================================

    grouped = {}

    for r in rows:
        category = r.get("CATEGORY") or "OTHER"
        type_ = r.get("TYPE") or "UNKNOWN"

        if category not in grouped:
            grouped[category] = {}

        if type_ not in grouped[category]:
            grouped[category][type_] = []

        grouped[category][type_].append({
            "id_number": r.get("ID_NUMBER"),
            "label": r.get("LABEL"),
            "value": r.get("VALUE"),
            "unit": r.get("UNIT"),
            "scale": r.get("SCALE"),
            "zone": r.get("ZONE"),
            "period": r.get("PERIOD"),
        })

    # ============================================================
    # FORMAT FINAL
    # ============================================================

    result = []

    # tri des catégories
    sorted_categories = sorted(
        grouped.keys(),
        key=lambda c: CATEGORY_ORDER.index(c)
        if c in CATEGORY_ORDER else 999
    )

    for category in sorted_categories:
        types = grouped[category]

        type_list = []

        for type_ in sorted(types.keys()):
            type_list.append({
                "type": type_,
                "numbers": types[type_]
            })

        result.append({
            "category": category,
            "types": type_list
        })

    return result

def get_numbers_feed_service(
    limit: int = 50,
    query: Optional[str] = None,
    universe_id: Optional[str] = None,
):

    where_clauses = ["TRUE"]
    params = {"limit": limit}

    # ============================================================
    # 🔎 QUERY
    # ============================================================

    if query:
        where_clauses.append("LOWER(n.LABEL) LIKE LOWER(@query)")
        params["query"] = f"%{query}%"

    # ============================================================
    # 🌍 UNIVERSE FILTER
    # ============================================================

    if universe_id:
        where_clauses.append(f"""
        EXISTS (
            SELECT 1
            FROM UNNEST(n.ENTITIES) e2

            LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION` sc2
              ON e2.ENTITY_TYPE = 'solution'
             AND sc2.ID_SOLUTION = e2.ENTITY_ID

            JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE` cu2
              ON (
                (e2.ENTITY_TYPE = 'company' AND cu2.ID_COMPANY = e2.ENTITY_ID)
                OR
                (e2.ENTITY_TYPE = 'solution' AND cu2.ID_COMPANY = sc2.ID_COMPANY)
              )

            WHERE cu2.ID_UNIVERSE = @universe_id
        )
        """)
        params["universe_id"] = universe_id

    where_sql = " AND ".join(where_clauses)

    # ============================================================
    # QUERY
    # ============================================================

    sql = f"""
    WITH solution_company AS (
        SELECT ID_SOLUTION, ID_COMPANY
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION`
    )

    SELECT
        n.*,
        ARRAY_AGG(DISTINCT cu.ID_UNIVERSE IGNORE NULLS) AS universes

    FROM `{VIEW_NUMBERS_CARDS}` n

    LEFT JOIN UNNEST(n.ENTITIES) e

    LEFT JOIN solution_company sc
      ON e.ENTITY_TYPE = 'solution'
     AND sc.ID_SOLUTION = e.ENTITY_ID

    LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE` cu
      ON (
        (e.ENTITY_TYPE = 'company' AND cu.ID_COMPANY = e.ENTITY_ID)
        OR
        (e.ENTITY_TYPE = 'solution' AND cu.ID_COMPANY = sc.ID_COMPANY)
      )

    WHERE {where_sql}

    GROUP BY
        n.ID_NUMBER,
        n.LABEL,
        n.VALUE,
        n.UNIT,
        n.SCALE,
        n.ZONE,
        n.PERIOD,
        n.CREATED_AT,
        n.TYPE,
        n.CATEGORY,
        n.ENTITIES

    ORDER BY n.CREATED_AT DESC
    LIMIT @limit
    """

    return query_bq(sql, params)


