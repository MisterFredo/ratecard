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
# CREATE COMPANY — DATA ONLY
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
        "MEDIA_LOGO_RECTANGLE_ID": None,
        "LINKEDIN_URL": data.linkedin_url or None,
        "WEBSITE_URL": data.website_url or None,
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
# LIST COMPANIES (ADMIN / LISTING LIGHT)
# ============================================================
def list_companies():
    """
    Liste des sociétés (version légère).
    Pas de wiki ici.
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
        WHERE c.IS_ACTIVE = TRUE
        ORDER BY NB_ANALYSES DESC, c.NAME ASC
    """

    rows = query_bq(sql)

    return [
        {
            "id_company": r["ID_COMPANY"],
            "name": r["NAME"],
            "is_partner": bool(r["IS_PARTNER"]),
            "media_logo_url": r["MEDIA_LOGO_RECTANGLE_ID"],
            "nb_analyses": r["NB_ANALYSES"],
            "delta_30d": r["DELTA_30D"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE COMPANY (DETAIL COMPLET)
# ============================================================
def get_company(company_id: str):
    """
    Récupère une société complète (inclut wiki_content).
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": company_id})

    if not rows:
        return None

    r = rows[0]

    return {
        "id_company": r["ID_COMPANY"],
        "name": r["NAME"],

        # --- Brand (éditorial Ratecard) ---
        "description": r.get("DESCRIPTION"),

        # --- Wiki simplifié ---
        "wiki_content": r.get("WIKI_CONTENT"),
        "wiki_source_id": r.get("WIKI_SOURCE_ID"),
        "wiki_updated_at": r.get("WIKI_UPDATED_AT"),
        "wiki_vectorised": r.get("WIKI_VECTORISED", False),

        # --- Media ---
        "media_logo_url": r.get("MEDIA_LOGO_RECTANGLE_ID"),

        # --- Liens ---
        "linkedin_url": r.get("LINKEDIN_URL"),
        "website_url": r.get("WEBSITE_URL"),

        # --- Statut ---
        "is_partner": bool(r.get("IS_PARTNER", False)),
        "is_active": r.get("IS_ACTIVE", True),

        # --- Dates ---
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# UPDATE COMPANY
# ============================================================
def update_company(id_company: str, data: CompanyUpdate) -> bool:
    """
    Met à jour une société existante.
    Supporte le wiki simplifié.
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    # Bool safe
    if "is_partner" in values:
        values["is_partner"] = bool(values["is_partner"])

    # Si wiki_content modifié → update timestamp wiki
    if "wiki_content" in values:
        values["wiki_updated_at"] = datetime.utcnow().isoformat()
        values["wiki_vectorised"] = False  # reset vectorisation

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_COMPANY,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_COMPANY": id_company},
    )
