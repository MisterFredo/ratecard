# backend/core/solution/service.py

import uuid
from datetime import datetime
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.solution.models import SolutionCreate, SolutionUpdate


TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_NUMBERS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_SOLUTION"


DEFAULT_FREQUENCY = "QUARTERLY"


# ============================================================
# CREATE SOLUTION
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
# LIST SOLUTIONS
# ============================================================
def list_solutions():

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

            -- ✅ HAS NUMBERS
            ns.ID_SOLUTION IS NOT NULL AS HAS_NUMBERS,

            -- 🔥 RADAR
            r.ID_INSIGHT,
            r.KEY_POINTS

        FROM `{TABLE_SOLUTION}` s

        LEFT JOIN `{TABLE_COMPANY}` c
          ON s.ID_COMPANY = c.ID_COMPANY

        LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_SOLUTION` st
          ON st.id_solution = s.ID_SOLUTION

        -- ✅ NUMBERS JOIN (OPTIMIZED)
        LEFT JOIN (
            SELECT DISTINCT ID_SOLUTION
            FROM `{TABLE_NUMBERS_SOLUTION}`
        ) ns
          ON ns.ID_SOLUTION = s.ID_SOLUTION

        -- 🔥 LATEST RADAR
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

            # ✅ NEW
            "has_numbers": r.get("HAS_NUMBERS", False),

            # 🔥 RADAR
            "last_radar": {
                "id_insight": r["ID_INSIGHT"],
                "key_points": r["KEY_POINTS"],
            } if r.get("ID_INSIGHT") else None,
        }
        for r in rows
    ]

def list_solutions_for_user(user_id: Optional[str]) -> List[Dict]:

    sql = f"""
    SELECT
        s.ID_SOLUTION as id_solution,
        s.NAME as name,
        s.ID_COMPANY as id_company,
        c.NAME as company_name,
        c.MEDIA_LOGO_RECTANGLE_ID

    FROM `{TABLE_SOLUTION}` s

    LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY` c
        ON c.ID_COMPANY = s.ID_COMPANY

    WHERE TRUE

    {f"""
    AND (
        NOT EXISTS (
            SELECT 1 FROM `{TABLE_USER_UNIVERSE}`
            WHERE ID_USER = @user_id
        )
        OR EXISTS (
            SELECT 1
            FROM `{TABLE_COMPANY_UNIVERSE}` cu
            JOIN `{TABLE_USER_UNIVERSE}` uu
              ON uu.ID_UNIVERSE = cu.ID_UNIVERSE
            WHERE uu.ID_USER = @user_id
              AND cu.ID_COMPANY = s.ID_COMPANY
        )
    )
    """ if user_id else ""}

    ORDER BY s.NAME
    """

    params = {}
    if user_id:
        params["user_id"] = user_id

    return query_bq(sql, params)


# ============================================================
# GET ONE SOLUTION
# ============================================================
def get_solution(id_solution: str):

    sql = f"""
        SELECT
            s.ID_SOLUTION,
            s.NAME,
            s.ID_COMPANY,
            s.DESCRIPTION,
            s.CONTENT,
            s.STATUS,
            s.VECTORISE,
            s.INSIGHT_FREQUENCY,
            s.CREATED_AT,
            s.UPDATED_AT,
            c.NAME AS COMPANY_NAME,

            -- ✅ HAS NUMBERS
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
    """

    rows = query_bq(sql, {"id": id_solution})

    if not rows:
        return None

    r = rows[0]

    return {
        "id_solution": r["ID_SOLUTION"],
        "name": r["NAME"],
        "id_company": r["ID_COMPANY"],
        "company_name": r["COMPANY_NAME"],
        "description": r["DESCRIPTION"],
        "content": r["CONTENT"],
        "status": r["STATUS"],
        "vectorise": r["VECTORISE"],
        "insight_frequency": r.get("INSIGHT_FREQUENCY"),
        "created_at": r["CREATED_AT"],
        "updated_at": r["UPDATED_AT"],

        # ✅ NEW
        "has_numbers": r.get("HAS_NUMBERS", False),
    }


# ============================================================
# UPDATE SOLUTION
# ============================================================
def update_solution(id_solution: str, data: SolutionUpdate) -> bool:

    values = data.dict(exclude_unset=True)

    if not values:
        return False

    field_map = {
        "name": "NAME",
        "id_company": "ID_COMPANY",
        "description": "DESCRIPTION",
        "content": "CONTENT",
        "status": "STATUS",
        "vectorise": "VECTORISE",
    }

    mapped = {
        field_map[k]: v
        for k, v in values.items()
        if k in field_map
    }

    mapped["UPDATED_AT"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_SOLUTION,
        fields=mapped,
        where={"ID_SOLUTION": id_solution},
    )


# ============================================================
# DELETE SOLUTION (SOFT DELETE)
# ============================================================
def delete_solution(id_solution: str) -> bool:

    existing = query_bq(
        f"""
        SELECT ID_SOLUTION
        FROM `{TABLE_SOLUTION}`
        WHERE ID_SOLUTION = @id
        """,
        {"id": id_solution},
    )

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
