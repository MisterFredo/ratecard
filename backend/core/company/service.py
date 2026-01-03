import uuid
from datetime import datetime
from typing import Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.company.models import CompanyCreate, CompanyUpdate

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


# ============================================================
# CREATE COMPANY — DATA ONLY
# ============================================================
def create_company(data: CompanyCreate) -> str:
    """
    Crée une société.
    Aucun champ média n'est autorisé ici.
    """
    company_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "DESCRIPTION": data.description,

        # ⚠️ PAS DE MEDIA AU CREATE

        "LINKEDIN_URL": data.linkedin_url,
        "WEBSITE_URL": data.website_url,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    insert_bq(TABLE_COMPANY, row)
    return company_id


# ============================================================
# LIST COMPANIES
# ============================================================
def list_companies():
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
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["UPDATED_AT"] = datetime.utcnow()

    return update_bq(
        table=TABLE_COMPANY,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_COMPANY": id_company},
    )
