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

# ⚠️ Base publique GCS — définie LOCALMENT (pas dans config)
# À aligner avec ce que le front utilise déjà
GCS_PUBLIC_BASE_URL = "https://storage.googleapis.com/ratecard-assets"
COMPANY_MEDIA_PATH = "companies"


# ============================================================
# CREATE COMPANY — DATA ONLY (LOAD JOB, NO STREAMING)
# ============================================================
def create_company(data: CompanyCreate) -> str:
    """
    Crée une société.
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
    job.result()

    return company_id


# ============================================================
# LIST COMPANIES
# ============================================================
def list_companies():
    sql = f"""
        SELECT
            c.ID_COMPANY,
            c.NAME,
            CAST(c.IS_PARTNER AS BOOL) AS IS_PARTNER,

            IF(
                c.MEDIA_LOGO_RECTANGLE_ID IS NOT NULL,
                CONCAT(
                    "{GCS_PUBLIC_BASE_URL}/{COMPANY_MEDIA_PATH}/",
                    c.MEDIA_LOGO_RECTANGLE_ID
                ),
                NULL
            ) AS MEDIA_LOGO_RECTANGLE_URL,

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
            "MEDIA_LOGO_RECTANGLE_URL": r["MEDIA_LOGO_RECTANGLE_URL"],
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
    Champs prêts à consommer par le frontend.
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

    # --------------------------------------------------------
    # NORMALISATION
    # --------------------------------------------------------

    # IS_PARTNER → bool JS fiable
    row["IS_PARTNER"] = bool(row.get("IS_PARTNER"))

    # URL publique du logo rectangle (source de vérité backend)
    if row.get("MEDIA_LOGO_RECTANGLE_ID"):
        row["MEDIA_LOGO_RECTANGLE_URL"] = (
            f"{GCS_PUBLIC_BASE_URL}/{COMPANY_MEDIA_PATH}/"
            f"{row['MEDIA_LOGO_RECTANGLE_ID']}"
        )
    else:
        row["MEDIA_LOGO_RECTANGLE_URL"] = None

    return row

# ============================================================
# UPDATE COMPANY
# ============================================================
def update_company(id_company: str, data: CompanyUpdate) -> bool:
    """
    Met à jour une société existante.
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
