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
        "CONTENT": data.content,
        "STATUS": data.status or "DRAFT",
        "VECTORISE": bool(data.vectorise),
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
            s.VECTORISE,
            s.CREATED_AT,
            s.UPDATED_AT
        FROM `{TABLE_SOLUTION}` s
        LEFT JOIN `{TABLE_COMPANY}` c
          ON s.ID_COMPANY = c.ID_COMPANY
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
            "vectorise": r["VECTORISE"],
            "created_at": r["CREATED_AT"],
            "updated_at": r["UPDATED_AT"],
        }
        for r in rows
    ]


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
            s.CREATED_AT,
            s.UPDATED_AT,
            c.NAME AS COMPANY_NAME
        FROM `{TABLE_SOLUTION}` s
        LEFT JOIN `{TABLE_COMPANY}` c
          ON s.ID_COMPANY = c.ID_COMPANY
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
        "created_at": r["CREATED_AT"],
        "updated_at": r["UPDATED_AT"],
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
