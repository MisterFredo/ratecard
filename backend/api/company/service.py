# backend/api/company/service.py

import uuid
from datetime import datetime
from backend.utils.bigquery_utils import insert_bq, query_bq
from backend.config import BQ_PROJECT, BQ_DATASET
from backend.api.company.models import CompanyCreate

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


def create_company(data: CompanyCreate) -> str:
    company_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "LOGO_URL": data.logo_url,
        "LOGO_SQUARE_URL": data.logo_square_url,
        "LINKEDIN_URL": data.linkedin_url,
        "DESCRIPTION": data.description,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_COMPANY, row)
    return company_id


def list_companies():
    sql = f"""
        SELECT *
        FROM `{TABLE_COMPANY}`
        ORDER BY NAME ASC
    """
    return query_bq(sql)


def get_company(company_id: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": company_id})
    return rows[0] if rows else None
