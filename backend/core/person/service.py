# backend/core/person/service.py

import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.person.models import PersonCreate

TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"


# ============================================================
# CREATE PERSON
# ============================================================
def create_person(data: PersonCreate) -> str:
    person_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_PERSON": person_id,
        "ID_COMPANY": data.id_company,

        "NAME": data.name,
        "TITLE": data.title,
        "DESCRIPTION": data.description,

        "MEDIA_PICTURE_RECTANGLE_ID": data.media_picture_rectangle_id,
        "MEDIA_PICTURE_SQUARE_ID": data.media_picture_square_id,

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
# LIST PERSONS BY COMPANY
# ============================================================
def list_persons_by_company(id_company: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_PERSON}`
        WHERE ID_COMPANY = @id
          AND IS_ACTIVE = TRUE
        ORDER BY NAME ASC
    """
    return query_bq(sql, {"id": id_company})


# ============================================================
# GET PERSON
# ============================================================
def get_person(id_person: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_PERSON}`
        WHERE ID_PERSON = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": id_person})
    return rows[0] if rows else None


# ============================================================
# UPDATE PERSON
# ============================================================
def update_person(id_person: str, data: PersonCreate):
    now = datetime.utcnow()

    row = [{
        "ID_PERSON": id_person,
        "ID_COMPANY": data.id_company,

        "NAME": data.name,
        "TITLE": data.title,
        "DESCRIPTION": data.description,

        "MEDIA_PICTURE_RECTANGLE_ID": data.media_picture_rectangle_id,
        "MEDIA_PICTURE_SQUARE_ID": data.media_picture_square_id,

        "LINKEDIN_URL": data.linkedin_url,

        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()
    errors = client.insert_rows_json(TABLE_PERSON, row)
    if errors:
        raise RuntimeError(errors)

    return True


