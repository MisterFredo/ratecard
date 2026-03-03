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
        "NAME": data.name,
        "ID_COMPANY": data.id_company,
        "DESCRIPTION": data.description,
        "CONTENT": data.content,
        "STATUS": data.status or "DRAFT",
        "VECTORISE": data.vectorise or False,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()
    job = client.load_table_from_json(
        row,
        TABLE_SOLUTION,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )
    job.result()

    return solution_id


# ============================================================
# LIST SOLUTIONS (ADMIN)
# ============================================================
def list_solutions():
    """
    Liste des solutions avec nom société si associée.
    Aligné avec le standard MAJUSCULES du projet.
    """
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
def get_solution(id_solution: str):
    """
    Récupère une solution complète.
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_SOLUTION}`
        WHERE ID_SOLUTION = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": id_solution})
    return rows[0] if rows else None


# ============================================================
# UPDATE SOLUTION
# ============================================================
def update_solution(id_solution: str, data: SolutionUpdate) -> bool:
    """
    Mise à jour partielle.
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_SOLUTION,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_SOLUTION": id_solution},
    )
