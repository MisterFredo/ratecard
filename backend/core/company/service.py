import uuid
from datetime import datetime
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.company.models import CompanyCreate, CompanyUpdate

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


# ============================================================
# CREATE COMPANY — DATA ONLY (LOAD JOB, NO STREAMING)
# ============================================================
def create_company(data: CompanyCreate) -> str:
    """
    Crée une société.

    Règles :
    - aucun champ média au create
    - insertion via LOAD JOB (pas de streaming)
    """
    company_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "DESCRIPTION": data.description,

        # ⚠️ PAS DE MEDIA AU CREATE
        "MEDIA_LOGO_SQUARE_ID": None,
        "MEDIA_LOGO_RECTANGLE_ID": None,

        "LINKEDIN_URL": data.linkedin_url,
        "WEBSITE_URL": data.website_url,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    client = get_bigquery_client()
    job = client.load_table_from_json(
        row,
        TABLE_COMPANY,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )
    job.result()  # ⬅️ bloquant = ligne immédiatement stable

    return company_id


# ============================================================
# LIST COMPANIES
# ============================================================
def list_companies():
    """
    Liste les sociétés actives (admin).
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_COMPANY}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY NAME ASC
    """
    return query_bq(sql)


# ============================================================
# GET ONE COMPANY
# ============================================================
def get_company(company_id: str):
    """
    Récupère une société par ID.
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": company_id})
    return rows[0] if rows else None


# ============================================================
# UPDATE COMPANY — DATA + MEDIA (POST-CREATION)
# ============================================================
def update_company(id_company: str, data: CompanyUpdate) -> bool:
    """
    Met à jour une société existante.

    Utilise UPDATE (pas de load job).
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_COMPANY,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_COMPANY": id_company},
    )
