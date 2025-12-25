# backend/core/person/service.py

import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq
from api.person.models import PersonCreate


TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"


def create_person(data: PersonCreate) -> str:
    person_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_PERSON": person_id,
        "ID_COMPANY": data.id_company,
        "NAME": data.name,
        "TITLE": data.title,
        "PROFILE_PICTURE_URL": data.profile_picture_url,
        "LINKEDIN_URL": data.linkedin_url,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    insert_bq(TABLE_PERSON, row)
    return person_id


def list_persons():
    sql = f"""
        SELECT *
        FROM `{TABLE_PERSON}`
        ORDER BY NAME ASC
    """
    return query_bq(sql)


def list_persons_by_company(id_company: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_PERSON}`
        WHERE ID_COMPANY = @id
        ORDER BY NAME ASC
    """
    return query_bq(sql, {"id": id_company})


def get_person(id_person: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_PERSON}`
        WHERE ID_PERSON = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": id_person})
    return rows[0] if rows else None
