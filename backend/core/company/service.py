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
    - un seul visuel possible : rectangle (16:9)
    - IS_PARTNER géré dès la création
    """
    company_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "DESCRIPTION": data.description or None,

        # 🔑 UN SEUL VISUEL : RECTANGLE
        "MEDIA_LOGO_RECTANGLE_ID": None,

        "LINKEDIN_URL": data.linkedin_url or None,
        "WEBSITE_URL": data.website_url or None,

        # PARTENAIRE
        "IS_PARTNER": bool(data.is_partner),

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
    sql = f"""
        SELECT
            co.ID_COMPANY,
            co.NAME,

            COUNT(c.ID_CONTENT) AS NB_ANALYSES,
            COUNTIF(
              DATE(c.PUBLISHED_AT) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            ) AS DELTA_30D

        FROM {TABLE_COMPANY} co
        LEFT JOIN {TABLE_CONTENT_COMPANY} cc
          ON cc.ID_COMPANY = co.ID_COMPANY
        LEFT JOIN {TABLE_CONTENT} c
          ON c.ID_CONTENT = cc.ID_CONTENT
          AND c.STATUS = 'PUBLISHED'
          AND c.IS_ACTIVE = TRUE

        GROUP BY co.ID_COMPANY, co.NAME
        ORDER BY NB_ANALYSES DESC, co.NAME ASC
    """

    rows = query_bq(sql)

    return [
        {
            "ID_COMPANY": r["ID_COMPANY"],
            "NAME": r["NAME"],
            "NB_ANALYSES": r["NB_ANALYSES"],
            "DELTA_30D": r["DELTA_30D"],
        }
        for r in rows
    ]


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

    # normalisation explicite
    if "is_partner" in values:
        values["is_partner"] = bool(values["is_partner"])

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_COMPANY,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_COMPANY": id_company},
    )
