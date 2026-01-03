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
        SELECT *
        FROM `{TABLE_PERSON}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY NAME ASC
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
    """
    Met à jour une personne existante.

    - update partiel
    - champs média autorisés
    - aucun overwrite involontaire
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    fields = []
    params = {
        "id": id_person,
        "updated_at": datetime.utcnow(),
    }

    for field, value in values.items():
        fields.append(f"{field.upper()} = @{field}")
        params[field] = value

    sql = f"""
        UPDATE `{TABLE_PERSON}`
        SET
            {", ".join(fields)},
            UPDATED_AT = @updated_at
        WHERE ID_PERSON = @id
    """

    client = get_bigquery_client()

    # ⚠️ On reconstruit un QueryJobConfig EXACTEMENT
    # comme dans query_bq / insert_bq
    job_config = client.query(
        "SELECT 1"
    )._job_config.__class__(  # ← récupération propre de la classe
        query_parameters=[
            *[
                {
                    "name": k,
                    "parameterType": {"type": "STRING"},
                    "parameterValue": {"value": v},
                }
                for k, v in params.items()
                if k != "updated_at"
            ],
            {
                "name": "updated_at",
                "parameterType": {"type": "TIMESTAMP"},
                "parameterValue": {"value": params["updated_at"]},
            },
        ]
    )

    client.query(sql, job_config=job_config).result()

    return True


