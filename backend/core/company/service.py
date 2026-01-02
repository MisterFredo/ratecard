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
    """
    Met à jour une société existante.

    - update partiel
    - champs média autorisés
    - aucun overwrite involontaire
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    fields = []
    params = {
        "id": id_company,
        "updated_at": datetime.utcnow(),
    }

    for field, value in values.items():
        fields.append(f"{field.upper()} = @{field}")
        params[field] = value

    sql = f"""
        UPDATE `{TABLE_COMPANY}`
        SET
            {", ".join(fields)},
            UPDATED_AT = @updated_at
        WHERE ID_COMPANY = @id
    """

    client = get_bigquery_client()
    client.query(sql, job_config={
        "query_parameters": [
            # paramètres injectés dynamiquement ci-dessous
        ]
    })

    # Exécution avec paramètres BigQuery explicites
    client.query(
        sql,
        job_config={
            "query_parameters": [
                *[
                    # paramètres champs
                    # (type déduit automatiquement)
                    {"name": k, "parameterType": {"type": "STRING"}, "parameterValue": {"value": v}}
                    for k, v in params.items()
                    if k not in ("updated_at",)
                ],
                {
                    "name": "updated_at",
                    "parameterType": {"type": "TIMESTAMP"},
                    "parameterValue": {"value": params["updated_at"]},
                },
            ]
        }
    ).result()

    return True
