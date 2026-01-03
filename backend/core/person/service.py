import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.person.models import PersonCreate, PersonUpdate

TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"


# ============================================================
# CREATE PERSON — DATA ONLY
# ============================================================
def create_person(data: PersonCreate) -> str:
    """
    Crée une personne.
    Aucun champ média n'est autorisé ici.
    """
    person_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_PERSON": person_id,
        "ID_COMPANY": data.id_company,

        "NAME": data.name,
        "TITLE": data.title,
        "DESCRIPTION": data.description,

        # ⚠️ PAS DE MEDIA AU CREATE

        "LINKEDIN_URL": data.linkedin_url,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    insert_bq(TABLE_PERSON, row)
    return person_id


# ============================================================
# LIST PERSONS
# ============================================================
def list_persons():
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

    # Champ technique
    values["UPDATED_AT"] = datetime.utcnow()

    return update_bq(
        table=TABLE_PERSON,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_PERSON": id_person},
    )

