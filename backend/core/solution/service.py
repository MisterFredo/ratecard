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
# CREATE SOLUTION — LOAD JOB
# ============================================================
def create_solution(data: SolutionCreate) -> str:
    """
    Crée une solution.
    Insertion via LOAD JOB pour stabilité immédiate.
    """
    solution_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_SOLUTION": solution_id,
        "NAME": data.NAME,
        "ID_COMPANY": data.ID_COMPANY,
        "DESCRIPTION": data.DESCRIPTION,
        "CONTENT": data.CONTENT,
        "STATUS": data.STATUS or "DRAFT",
        "VECTORISE": data.VECTORISE or False,
        "CREATED_AT": now,
        "UPDATED_AT": now,
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
            "ID_SOLUTION": r["ID_SOLUTION"],
            "NAME": r["NAME"],
            "STATUS": r["STATUS"],
            "ID_COMPANY": r["ID_COMPANY"],
            "COMPANY_NAME": r["COMPANY_NAME"],
            "VECTORISE": r["VECTORISE"],
            "CREATED_AT": r["CREATED_AT"],
            "UPDATED_AT": r["UPDATED_AT"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE SOLUTION
# ============================================================
def get_solution(ID_SOLUTION: str):
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

    rows = query_bq(sql, {"id": ID_SOLUTION})

    if not rows:
        return None

    r = rows[0]

    return {
        "ID_SOLUTION": r["ID_SOLUTION"],
        "NAME": r["NAME"],
        "ID_COMPANY": r["ID_COMPANY"],
        "COMPANY_NAME": r["COMPANY_NAME"],
        "DESCRIPTION": r["DESCRIPTION"],
        "CONTENT": r["CONTENT"],
        "STATUS": r["STATUS"],
        "VECTORISE": r["VECTORISE"],
        "CREATED_AT": r["CREATED_AT"],
        "UPDATED_AT": r["UPDATED_AT"],
    }


# ============================================================
# UPDATE SOLUTION
# ============================================================
def update_solution(ID_SOLUTION: str, data: SolutionUpdate) -> bool:
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["UPDATED_AT"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_SOLUTION,
        fields=values,
        where={"ID_SOLUTION": ID_SOLUTION},
    )
