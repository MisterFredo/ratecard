import uuid
from datetime import datetime
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.person.models import PersonCreate, PersonUpdate

TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"


# ============================================================
# CREATE PERSON — DATA ONLY (LOAD JOB, NO STREAMING)
# ============================================================
def create_person(data: PersonCreate) -> str:
    """
    Crée une personne.

    Règles :
    - aucun champ média au create
    - insertion via LOAD JOB (pas de streaming)
    """
    person_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_PERSON": person_id,
        "ID_COMPANY": data.id_company,

        "NAME": data.name,
        "TITLE": data.title,
        "DESCRIPTION": data.description,

        # ⚠️ PAS DE MEDIA AU CREATE
        "MEDIA_PORTRAIT_ID": None,

        "LINKEDIN_URL": data.linkedin_url,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    client = get_bigquery_client()
    job = client.load_table_from_json(
        row,
        TABLE_PERSON,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )
    job.result()  # ⬅️ bloquant = ligne immédiatement stable

    return person_id


# ============================================================
# LIST PERSONS
# ============================================================
def list_persons():
    """
    Liste les personnes actives (admin).
    """
    sql = f"""
        SELECT
            p.*,
            c.NAME AS COMPANY_NAME
        FROM `{TABLE_PERSON}` p
        LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY` c
            ON p.ID_COMPANY = c.ID_COMPANY
        WHERE p.IS_ACTIVE = TRUE
        ORDER BY p.NAME ASC
    """
    return query_bq(sql)


# ============================================================
# GET ONE PERSON
# ============================================================
def get_person(person_id: str):
    """
    Récupère une personne par ID.
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_PERSON}`
        WHERE ID_PERSON = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": person_id})
    return rows[0] if rows else None


# ============================================================
# UPDATE PERSON — DATA + MEDIA (POST-CREATION)
# ============================================================
def update_person(id_person: str, data: PersonUpdate) -> bool:

    values = data.dict(exclude_unset=True)

    if not values:
        return False

    now = datetime.utcnow().isoformat()

    mapping = {
        "name": "NAME",
        "id_company": "ID_COMPANY",
        "title": "TITLE",
        "description": "DESCRIPTION",
        "linkedin_url": "LINKEDIN_URL",

        # 🔑 ALIGNEMENT MEDIA
        "media_picture_square_id": "MEDIA_PORTRAIT_ID",
        "media_picture_rectangle_id": "MEDIA_PORTRAIT_ID",
    }

    bq_values = {
        mapping[k]: v
        for k, v in values.items()
        if k in mapping
    }

    bq_values["UPDATED_AT"] = now

    return update_bq(
        table=TABLE_PERSON,
        fields=bq_values,
        where={"ID_PERSON": id_person},
    )
