import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.company.models import CompanyCreate

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


# ============================================================
# CREATE COMPANY
# ============================================================
def create_company(data: CompanyCreate) -> str:
    company_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "DESCRIPTION": data.description,

        "MEDIA_LOGO_RECTANGLE_ID": data.media_logo_rectangle_id,
        "MEDIA_LOGO_SQUARE_ID": data.media_logo_square_id,

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
# UPDATE COMPANY
# ============================================================
def update_company(id_company: str, data: CompanyCreate):
    now = datetime.utcnow()

    row = [{
        "ID_COMPANY": id_company,
        "NAME": data.name,
        "DESCRIPTION": data.description,

        "MEDIA_LOGO_RECTANGLE_ID": data.media_logo_rectangle_id,
        "MEDIA_LOGO_SQUARE_ID": data.media_logo_square_id,

        "LINKEDIN_URL": data.linkedin_url,
        "WEBSITE_URL": data.website_url,

        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()
    errors = client.insert_rows_json(TABLE_COMPANY, row)
    if errors:
        raise RuntimeError(errors)

    return True
