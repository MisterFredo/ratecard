# backend/core/company/service.py

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
TABLE_COMPANY_METRICS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_METRICS"


# ============================================================
# CREATE COMPANY — MAJUSCULES
# ============================================================
def create_company(data: CompanyCreate) -> str:
    company_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.NAME,
        "DESCRIPTION": data.DESCRIPTION or None,
        "MEDIA_LOGO_RECTANGLE_ID": None,
        "LINKEDIN_URL": data.LINKEDIN_URL or None,
        "WEBSITE_URL": data.WEBSITE_URL or None,
        "IS_PARTNER": bool(data.IS_PARTNER),
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
    job.result()

    return company_id


# ============================================================
# LIST COMPANIES — MAJUSCULES
# ============================================================
def list_companies():
    sql = f"""
        SELECT
            c.ID_COMPANY,
            c.NAME,
            CAST(c.IS_PARTNER AS BOOL) AS IS_PARTNER,
            c.MEDIA_LOGO_RECTANGLE_ID,
            COALESCE(m.NB_ANALYSES, 0) AS NB_ANALYSES,
            COALESCE(m.LAST_30_DAYS, 0) AS DELTA_30D,
            CASE
                WHEN c.DESCRIPTION IS NOT NULL
                     AND TRIM(c.DESCRIPTION) != ""
                THEN TRUE ELSE FALSE
            END AS HAS_DESCRIPTION,
            CASE
                WHEN c.WIKI_CONTENT IS NOT NULL
                     AND TRIM(c.WIKI_CONTENT) != ""
                THEN TRUE ELSE FALSE
            END AS HAS_WIKI
        FROM `{TABLE_COMPANY}` c
        LEFT JOIN `{TABLE_COMPANY_METRICS}` m
          ON m.ID_COMPANY = c.ID_COMPANY
        WHERE c.IS_ACTIVE = TRUE
        ORDER BY NB_ANALYSES DESC, c.NAME ASC
    """

    return query_bq(sql)  # ⚠️ brut BQ


# ============================================================
# GET ONE COMPANY — MAJUSCULES
# ============================================================
def get_company(company_id: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": company_id})

    if not rows:
        return None

    return rows[0]  # ⚠️ brut BQ


# ============================================================
# UPDATE COMPANY — MAJUSCULES
# ============================================================
def update_company(id_company: str, data: CompanyUpdate) -> bool:
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    # Mise à jour timestamp si WIKI_CONTENT modifié
    if "WIKI_CONTENT" in values:
        values["WIKI_UPDATED_AT"] = datetime.utcnow().isoformat()
        values["WIKI_VECTORISED"] = False

    values["UPDATED_AT"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_COMPANY,
        fields=values,  # ⚠️ plus de upper()
        where={"ID_COMPANY": id_company},
    )
