# backend/core/solution/service.py

import uuid
from datetime import datetime
from typing import Optional, List, Dict

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.solution.models import SolutionCreate, SolutionUpdate


# ============================================================
# TABLES
# ============================================================

TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_NUMBERS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_SOLUTION"
TABLE_COMPANY_UNIVERSE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE"
TABLE_SOLUTION_ALIAS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION_ALIAS"

VIEW_STATS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_SOLUTION"

DEFAULT_FREQUENCY = "QUARTERLY"


# ============================================================
# CREATE
# ============================================================

def create_solution(data: SolutionCreate) -> str:

    solution_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_SOLUTION": solution_id,
        "NAME": data.name,
        "ID_COMPANY": data.id_company,
        "DESCRIPTION": data.description,
        "CONTENT": data.content or None,
        "STATUS": data.status or "DRAFT",
        "VECTORISE": bool(data.vectorise),
        "INSIGHT_FREQUENCY": DEFAULT_FREQUENCY,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        TABLE_SOLUTION,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    return solution_id


# ============================================================
# LIST (ALIGNÉE COMPANY)
# ============================================================

def list_solutions() -> List[Dict]:

    sql = f"""
    SELECT
        s.ID_SOLUTION,
        s.NAME,
        s.STATUS,
        s.ID_COMPANY,

        c.NAME AS COMPANY_NAME,
        c.MEDIA_LOGO_RECTANGLE_ID,
        CAST(c.IS_PARTNER AS BOOL) AS IS_PARTNER,

        s.VECTORISE,
        s.INSIGHT_FREQUENCY,
        s.CREATED_AT,
        s.UPDATED_AT,

        COALESCE(st.total, 0) AS NB_ANALYSES,
        COALESCE(st.last_30_days, 0) AS DELTA_30D,

        ns.ID_SOLUTION IS NOT NULL AS HAS_NUMBERS,

        r.ID_INSIGHT,
        r.KEY_POINTS,

        -- 🔥 univers hérités via company
        ARRAY_AGG(DISTINCT u.LABEL IGNORE NULLS) AS universes

    FROM `{TABLE_SOLUTION}` s

    LEFT JOIN `{TABLE_COMPANY}` c
      ON s.ID_COMPANY = c.ID_COMPANY

    LEFT JOIN `{TABLE_COMPANY_UNIVERSE}` cu
      ON cu.ID_COMPANY = s.ID_COMPANY

    LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_UNIVERSE` u
      ON u.ID_UNIVERSE = cu.ID_UNIVERSE

    LEFT JOIN `{VIEW_STATS_SOLUTION}` st
      ON st.id_solution = s.ID_SOLUTION

    LEFT JOIN (
        SELECT DISTINCT ID_SOLUTION
        FROM `{TABLE_NUMBERS_SOLUTION}`
    ) ns
      ON ns.ID_SOLUTION = s.ID_SOLUTION

    LEFT JOIN (
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_RADAR`
        WHERE STATUS = "GENERATED"
        QUALIFY ROW_NUMBER() OVER (
            PARTITION BY ENTITY_TYPE, ENTITY_ID
            ORDER BY YEAR DESC, PERIOD DESC
        ) = 1
    ) r
      ON r.ENTITY_ID = s.ID_SOLUTION
      AND r.ENTITY_TYPE = "solution"

    WHERE s.IS_ACTIVE = TRUE

    GROUP BY
        s.ID_SOLUTION,
        s.NAME,
        s.STATUS,
        s.ID_COMPANY,
        c.NAME,
        c.MEDIA_LOGO_RECTANGLE_ID,
        c.IS_PARTNER,
        s.VECTORISE,
        s.INSIGHT_FREQUENCY,
        s.CREATED_AT,
        s.UPDATED_AT,
        st.total,
        st.last_30_days,
        ns.ID_SOLUTION,
        r.ID_INSIGHT,
        r.KEY_POINTS

    ORDER BY UPPER(s.NAME)
    """

    # 🔥 FIX CRITIQUE
    rows = query_bq(sql, {})

    return [
        {
            "id_solution": r["ID_SOLUTION"],
            "name": r["NAME"],
            "id_company": r["ID_COMPANY"],
            "company_name": r.get("COMPANY_NAME"),

            "media_logo_rectangle_id": r.get("MEDIA_LOGO_RECTANGLE_ID"),
            "is_partner": r.get("IS_PARTNER", False),

            "status": r.get("STATUS"),
            "vectorise": r.get("VECTORISE", False),
            "insight_frequency": r.get("INSIGHT_FREQUENCY"),

            "created_at": r.get("CREATED_AT"),
            "updated_at": r.get("UPDATED_AT"),

            "nb_analyses": r.get("NB_ANALYSES", 0),
            "delta_30d": r.get("DELTA_30D", 0),

            "has_numbers": r.get("HAS_NUMBERS", False),

            "last_radar": {
                "id_insight": r["ID_INSIGHT"],
                "key_points": r["KEY_POINTS"],
            } if r.get("ID_INSIGHT") else None,

            # 🔥 toujours safe
            "universes": r.get("universes") or [],
        }
        for r in rows
    ]

def list_solutions_for_user(user_id: str):

    sql = f"""
    SELECT
        s.ID_SOLUTION,
        s.NAME,
        s.STATUS,
        s.ID_COMPANY,

        c.NAME AS COMPANY_NAME,
        c.MEDIA_LOGO_RECTANGLE_ID,
        CAST(c.IS_PARTNER AS BOOL) AS IS_PARTNER,

        s.VECTORISE,
        s.INSIGHT_FREQUENCY,
        s.CREATED_AT,
        s.UPDATED_AT,

        COALESCE(st.total, 0) AS NB_ANALYSES,
        COALESCE(st.last_30_days, 0) AS DELTA_30D,

        -- ✅ SAFE BOOL
        IF(ns.ID_SOLUTION IS NOT NULL, TRUE, FALSE) AS HAS_NUMBERS,

        r.ID_INSIGHT,
        r.KEY_POINTS,

        -- 🔥 CRITIQUE POUR LE FRONT
        ARRAY_AGG(DISTINCT u.LABEL IGNORE NULLS) AS universes

    FROM `{TABLE_SOLUTION}` s

    JOIN `{TABLE_COMPANY}` c
      ON s.ID_COMPANY = c.ID_COMPANY

    JOIN `{TABLE_COMPANY_UNIVERSE}` cu
      ON cu.ID_COMPANY = c.ID_COMPANY

    JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_UNIVERSE` u
      ON u.ID_UNIVERSE = cu.ID_UNIVERSE

    JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE` uu
      ON uu.ID_UNIVERSE = cu.ID_UNIVERSE

    LEFT JOIN `{VIEW_STATS_SOLUTION}` st
      ON st.id_solution = s.ID_SOLUTION

    LEFT JOIN (
        SELECT DISTINCT ID_SOLUTION
        FROM `{TABLE_NUMBERS_SOLUTION}`
    ) ns
      ON ns.ID_SOLUTION = s.ID_SOLUTION

    LEFT JOIN (
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_RADAR`
        WHERE STATUS = "GENERATED"
        QUALIFY ROW_NUMBER() OVER (
            PARTITION BY ENTITY_TYPE, ENTITY_ID
            ORDER BY YEAR DESC, PERIOD DESC
        ) = 1
    ) r
      ON r.ENTITY_ID = s.ID_SOLUTION
      AND r.ENTITY_TYPE = "solution"

    WHERE
        s.IS_ACTIVE = TRUE
        AND uu.ID_USER = '{user_id}'

    GROUP BY
        s.ID_SOLUTION,
        s.NAME,
        s.STATUS,
        s.ID_COMPANY,
        c.NAME,
        c.MEDIA_LOGO_RECTANGLE_ID,
        c.IS_PARTNER,
        s.VECTORISE,
        s.INSIGHT_FREQUENCY,
        s.CREATED_AT,
        s.UPDATED_AT,
        st.total,
        st.last_30_days,
        ns.ID_SOLUTION,
        r.ID_INSIGHT,
        r.KEY_POINTS

    ORDER BY s.NAME ASC
    """

    rows = query_bq(sql)

    return [
        {
            "id_solution": r["ID_SOLUTION"],
            "name": r["NAME"],
            "status": r["STATUS"],
            "id_company": r["ID_COMPANY"],
            "company_name": r["COMPANY_NAME"],

            "media_logo_rectangle_id": r["MEDIA_LOGO_RECTANGLE_ID"],
            "is_partner": r["IS_PARTNER"],

            "vectorise": r["VECTORISE"],
            "insight_frequency": r.get("INSIGHT_FREQUENCY"),

            "created_at": r["CREATED_AT"],
            "updated_at": r["UPDATED_AT"],

            "nb_analyses": r["NB_ANALYSES"],
            "delta_30d": r["DELTA_30D"],

            "has_numbers": r.get("HAS_NUMBERS", False),

            "last_radar": {
                "id_insight": r["ID_INSIGHT"],
                "key_points": r["KEY_POINTS"],
            } if r.get("ID_INSIGHT") else None,

            # 🔥 CRITIQUE POUR TON UI
            "universes": r.get("universes") or [],
        }
        for r in rows
    ]
# ============================================================
# GET ONE
# ============================================================

def get_solution(id_solution: str):

    rows = query_bq(f"""
        SELECT
            s.*,
            c.NAME AS COMPANY_NAME,
            ns.ID_SOLUTION IS NOT NULL AS HAS_NUMBERS
        FROM `{TABLE_SOLUTION}` s
        LEFT JOIN `{TABLE_COMPANY}` c
          ON s.ID_COMPANY = c.ID_COMPANY
        LEFT JOIN (
            SELECT DISTINCT ID_SOLUTION
            FROM `{TABLE_NUMBERS_SOLUTION}`
        ) ns
          ON ns.ID_SOLUTION = s.ID_SOLUTION
        WHERE s.ID_SOLUTION = @id
        LIMIT 1
    """, {"id": id_solution})

    if not rows:
        return None

    r = rows[0]

    return {
        "id_solution": r["ID_SOLUTION"],
        "name": r["NAME"],
        "id_company": r["ID_COMPANY"],
        "company_name": r.get("COMPANY_NAME"),
        "description": r.get("DESCRIPTION"),
        "content": r.get("CONTENT"),
        "status": r.get("STATUS"),
        "vectorise": r.get("VECTORISE"),
        "insight_frequency": r.get("INSIGHT_FREQUENCY"),
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
        "has_numbers": r.get("HAS_NUMBERS", False),
    }


# ============================================================
# UPDATE
# ============================================================

def update_solution(id_solution: str, data: SolutionUpdate) -> bool:

    values = data.dict(exclude_unset=True)

    if not values:
        return False

    mapping = {
        "name": "NAME",
        "id_company": "ID_COMPANY",
        "description": "DESCRIPTION",
        "content": "CONTENT",
        "status": "STATUS",
        "vectorise": "VECTORISE",
    }

    bq_values = {
        mapping[k]: v
        for k, v in values.items()
        if k in mapping
    }

    bq_values["UPDATED_AT"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_SOLUTION,
        fields=bq_values,
        where={"ID_SOLUTION": id_solution},
    )


# ============================================================
# DELETE (SOFT)
# ============================================================

def delete_solution(id_solution: str) -> bool:

    existing = query_bq(f"""
        SELECT ID_SOLUTION
        FROM `{TABLE_SOLUTION}`
        WHERE ID_SOLUTION = @id
    """, {"id": id_solution})

    if not existing:
        return False

    return update_bq(
        table=TABLE_SOLUTION,
        fields={
            "IS_ACTIVE": False,
            "UPDATED_AT": datetime.utcnow().isoformat(),
        },
        where={"ID_SOLUTION": id_solution},
    )
