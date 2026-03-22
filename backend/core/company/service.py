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


ALLOWED_FREQUENCIES = ["WEEKLY", "MONTHLY", "QUARTERLY"]


# ============================================================
# CREATE COMPANY
# ============================================================
def create_company(data: CompanyCreate) -> str:
    company_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    insight_frequency = data.insight_frequency or "QUARTERLY"

    if insight_frequency not in ALLOWED_FREQUENCIES:
        raise ValueError("Invalid insight_frequency")

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "TYPE": data.type,
        "DESCRIPTION": data.description or None,
        "MEDIA_LOGO_RECTANGLE_ID": None,
        "LINKEDIN_URL": data.linkedin_url or None,
        "WEBSITE_URL": data.website_url or None,
        "IS_PARTNER": bool(data.is_partner),
        "INSIGHT_FREQUENCY": insight_frequency,  # 🔥 NEW
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
# LIST COMPANIES — BQ BRUT
# ============================================================
def list_companies():
    sql = f"""
        SELECT
            c.ID_COMPANY,
            c.NAME,
            c.TYPE,
            CAST(c.IS_PARTNER AS BOOL) AS IS_PARTNER,
            c.MEDIA_LOGO_RECTANGLE_ID,
            c.INSIGHT_FREQUENCY,

            COALESCE(m.total, 0) AS NB_ANALYSES,
            COALESCE(m.last_30_days, 0) AS DELTA_30D,

            CASE
                WHEN c.DESCRIPTION IS NOT NULL
                     AND TRIM(c.DESCRIPTION) != ""
                THEN TRUE ELSE FALSE
            END AS HAS_DESCRIPTION,

            CASE
                WHEN c.WIKI_CONTENT IS NOT NULL
                     AND TRIM(c.WIKI_CONTENT) != ""
                THEN TRUE ELSE FALSE
            END AS HAS_WIKI,

            -- 🔥 RADAR
            r.ID_INSIGHT,
            r.KEY_POINTS

        FROM `{TABLE_COMPANY}` c

        LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_COMPANY` m
          ON m.id_company = c.ID_COMPANY

        -- 🔥 LATEST RADAR
        LEFT JOIN (
            SELECT *
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_RADAR`
            WHERE STATUS = "GENERATED"

            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY ENTITY_ID
                ORDER BY YEAR DESC, PERIOD DESC
            ) = 1
        ) r
          ON r.ENTITY_ID = c.ID_COMPANY
          AND r.ENTITY_TYPE = "company"

        WHERE c.IS_ACTIVE = TRUE

        ORDER BY NB_ANALYSES DESC, c.NAME ASC
    """

    rows = query_bq(sql)

    return [
        {
            "id_company": r["ID_COMPANY"],
            "name": r["NAME"],
            "type": r.get("TYPE"),
            "is_partner": r["IS_PARTNER"],
            "media_logo_rectangle_id": r["MEDIA_LOGO_RECTANGLE_ID"],
            "insight_frequency": r.get("INSIGHT_FREQUENCY"),
            "nb_analyses": r["NB_ANALYSES"],
            "delta_30d": r["DELTA_30D"],
            "has_description": r["HAS_DESCRIPTION"],
            "has_wiki": r["HAS_WIKI"],

            # 🔥 NEW
            "last_radar": {
                "id_insight": r["ID_INSIGHT"],
                "key_points": r["KEY_POINTS"],
            } if r.get("ID_INSIGHT") else None,
        }
        for r in rows
    ]

def list_company_types():

    client = get_bigquery_client()

    query = f"""
        SELECT
            ID_TYPE,
            LABEL
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_TYPE`
        ORDER BY LABEL
    """

    rows = client.query(query).result()

    return [
        {
            "id_type": row["ID_TYPE"],
            "label": row["LABEL"],
        }
        for row in rows
    ]


# ============================================================
# GET ONE COMPANY — BQ BRUT
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

    r = rows[0]

    return {
        "id_company": r["ID_COMPANY"],
        "name": r["NAME"],
        "type": r.get("TYPE"),
        "description": r.get("DESCRIPTION"),

        # Wiki
        "wiki_content": r.get("WIKI_CONTENT"),
        "wiki_source_id": r.get("WIKI_SOURCE_ID"),
        "wiki_updated_at": r.get("WIKI_UPDATED_AT"),
        "wiki_vectorised": r.get("WIKI_VECTORISED", False),

        # Media
        "media_logo_rectangle_id": r.get("MEDIA_LOGO_RECTANGLE_ID"),

        # Liens
        "linkedin_url": r.get("LINKEDIN_URL"),
        "website_url": r.get("WEBSITE_URL"),

        # Statut
        "is_partner": r.get("IS_PARTNER", False),
        "is_active": r.get("IS_ACTIVE", True),

        # 🔥 NEW
        "insight_frequency": r.get("INSIGHT_FREQUENCY"),

        # Dates
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# UPDATE COMPANY
# ============================================================
def update_company(id_company: str, data: CompanyUpdate) -> bool:
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    mapping = {
        "name": "NAME",
        "type": "TYPE",
        "description": "DESCRIPTION",
        "linkedin_url": "LINKEDIN_URL",
        "website_url": "WEBSITE_URL",
        "is_partner": "IS_PARTNER",
        "wiki_content": "WIKI_CONTENT",
        "insight_frequency": "INSIGHT_FREQUENCY",  # 🔥 NEW
    }

    bq_values = {
        mapping[k]: v
        for k, v in values.items()
        if k in mapping
    }

    # 🔥 validation
    if "INSIGHT_FREQUENCY" in bq_values:
        if bq_values["INSIGHT_FREQUENCY"] not in ALLOWED_FREQUENCIES:
            raise ValueError("Invalid insight_frequency")

    if "WIKI_CONTENT" in bq_values:
        bq_values["WIKI_UPDATED_AT"] = datetime.utcnow().isoformat()
        bq_values["WIKI_VECTORISED"] = False

    bq_values["UPDATED_AT"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_COMPANY,
        fields=bq_values,
        where={"ID_COMPANY": id_company},
    )


# ============================================================
# DELETE COMPANY (SOFT DELETE)
# ============================================================
def delete_company(id_company: str) -> bool:

    return update_bq(
        table=TABLE_COMPANY,
        fields={
            "IS_ACTIVE": False,
            "UPDATED_AT": datetime.utcnow().isoformat(),
        },
        where={"ID_COMPANY": id_company},
    )
