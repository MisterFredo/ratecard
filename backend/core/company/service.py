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
# CREATE COMPANY — DATA ONLY (LOAD JOB, NO STREAMING)
# ============================================================
def create_company(data: CompanyCreate) -> str:
    """
    Crée une société (données uniquement).
    Le visuel est uploadé dans un second temps.
    """
    company_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "DESCRIPTION": data.description or None,

        # 🔑 UN SEUL VISUEL SOCIÉTÉ — NOM DE FICHIER GCS
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
    job.result()

    return company_id


# ============================================================
# LIST COMPANIES (ADMIN / LISTING)
# ============================================================
def list_companies():
    """
    Liste des sociétés.
    Le backend renvoie uniquement le nom du fichier GCS du logo.
    L’URL est construite côté frontend.
    """
    sql = f"""
        SELECT
            c.ID_COMPANY,
            c.NAME,
            CAST(c.IS_PARTNER AS BOOL) AS IS_PARTNER,
            c.MEDIA_LOGO_RECTANGLE_ID,
            COALESCE(m.NB_ANALYSES, 0) AS NB_ANALYSES,
            COALESCE(m.LAST_30_DAYS, 0) AS DELTA_30D
        FROM `{TABLE_COMPANY}` c
        LEFT JOIN `{TABLE_COMPANY_METRICS}` m
          ON m.ID_COMPANY = c.ID_COMPANY
        ORDER BY NB_ANALYSES DESC, c.NAME ASC
    """

    rows = query_bq(sql)

    return [
        {
            "ID_COMPANY": r["ID_COMPANY"],
            "NAME": r["NAME"],
            "IS_PARTNER": bool(r["IS_PARTNER"]),
            "MEDIA_LOGO_RECTANGLE_ID": r["MEDIA_LOGO_RECTANGLE_ID"],
            "NB_ANALYSES": r["NB_ANALYSES"],
            "DELTA_30D": r["DELTA_30D"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE COMPANY (ADMIN / EDIT)
# ============================================================
def get_company(company_id: str):
    """
    Récupère une société par ID.
    Aucun calcul d’URL image côté backend.
    """
    sql = f"""
        SELECT
            c.*
        FROM `{TABLE_COMPANY}` c
        WHERE c.ID_COMPANY = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": company_id})

    if not rows:
        return None

    row = dict(rows[0])

    # Normalisation bool pour le frontend
    row["IS_PARTNER"] = bool(row.get("IS_PARTNER"))

    return row


# ============================================================
# UPDATE COMPANY
# ============================================================
def update_company(id_company: str, data: CompanyUpdate) -> bool:
    """
    Met à jour une société existante (hors visuel).
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    if "is_partner" in values:
        values["is_partner"] = bool(values["is_partner"])

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_COMPANY,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_COMPANY": id_company},
    )
