import uuid
from datetime import datetime, date
from typing import Optional
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    insert_bq,
    get_bigquery_client,
    update_bq,
)

from api.content.models import ContentCreate, ContentUpdate


# ============================================================
# TABLES
# ============================================================
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_EVENT"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"
TABLE_CONTENT_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_PERSON"

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_EVENT"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"


# ============================================================
# UTILS
# ============================================================
def normalize_array(value):
    """
    Force une valeur à être compatible avec ARRAY<STRING> BigQuery.
    """
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if isinstance(v, str) and v.strip()]
    return []


# ============================================================
# CREATE CONTENT — ANALYSE RATECARD
# ============================================================
def create_content(data: ContentCreate) -> str:
    """
    Crée un contenu ANALYTIQUE Ratecard (validation humaine).

    Règles métier :
    - angle_title obligatoire
    - angle_signal obligatoire
    - au moins UNE entité associée
    - PAS de logique de visuel au niveau contenu
    """

    if not data.angle_title or not data.angle_title.strip():
        raise ValueError("ANGLE_TITLE obligatoire")

    if not data.angle_signal or not data.angle_signal.strip():
        raise ValueError("ANGLE_SIGNAL obligatoire")

    if not (
        data.topics
        or data.events
        or data.companies
        or data.persons
    ):
        raise ValueError(
            "Un contenu analytique doit être associé à au moins une entité "
            "(topic, event, company ou person)"
        )

    content_id = str(uuid.uuid4())

    # ---------------------------------------------------------
    # DATES
    # ---------------------------------------------------------
    today = date.today()
    date_creation = data.date_creation or today
    date_import = data.date_import or today
    now = datetime.utcnow()

    # ---------------------------------------------------------
    # ROW PRINCIPALE (SANS VISUEL)
    # ---------------------------------------------------------
    row = [{
        "ID_CONTENT": content_id,
        "STATUS": "DRAFT",
        "IS_ACTIVE": True,
        "AUTHOR": data.author,

        # SOURCE
        "SOURCE_TYPE": data.source_type,
        "SOURCE_TEXT": data.source_text,
        "SOURCE_URL": data.source_url,
        "SOURCE_AUTHOR": data.source_author,

        # ANGLE
        "ANGLE_TITLE": data.angle_title,
        "ANGLE_SIGNAL": data.angle_signal,

        # CONTENU
        "EXCERPT": data.excerpt,
        "CONCEPT": data.concept,
        "CONTENT_BODY": data.content_body,

        # AIDES ÉDITORIALES
        "CITATIONS": normalize_array(data.citations),
        "CHIFFRES": normalize_array(data.chiffres),
        "ACTEURS_CITES": normalize_array(data.acteurs_cites),

        # SEO
        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,

        # DATES
        "DATE_CREATION": date_creation.isoformat(),
        "DATE_IMPORT": date_import.isoformat(),

        # PUBLICATION
        "PUBLISHED_AT": None,
    }]

    client = get_bigquery_client()

    # ---------------------------------------------------------
    # INSERT VIA LOAD JOB (ANTI STREAMING BUFFER)
    # ---------------------------------------------------------
    client.load_table_from_json(
        row,
        TABLE_CONTENT,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    # ---------------------------------------------------------
    # RELATIONS
    # ---------------------------------------------------------
    if data.topics:
        insert_bq(
            TABLE_CONTENT_TOPIC,
            [
                {"ID_CONTENT": content_id, "ID_TOPIC": tid, "CREATED_AT": now}
                for tid in data.topics
            ],
        )

    if data.events:
        insert_bq(
            TABLE_CONTENT_EVENT,
            [
                {"ID_CONTENT": content_id, "ID_EVENT": eid, "CREATED_AT": now}
                for eid in data.events
            ],
        )

    if data.companies:
        insert_bq(
            TABLE_CONTENT_COMPANY,
            [
                {"ID_CONTENT": content_id, "ID_COMPANY": cid, "CREATED_AT": now}
                for cid in data.companies
            ],
        )

    if data.persons:
        insert_bq(
            TABLE_CONTENT_PERSON,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_PERSON": p.id_person,
                    "ROLE": p.role,
                    "CREATED_AT": now,
                }
                for p in data.persons
            ],
        )

    return content_id


# ============================================================
# GET ONE CONTENT (ENRICHI)
# ============================================================
def get_content(id_content: str):
    rows = query_bq(
        f"""
        SELECT *
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT = @id
        LIMIT 1
        """,
        {"id": id_content}
    )

    if not rows:
        return None

    content = rows[0]

    content["topics"] = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL
        FROM `{TABLE_CONTENT_TOPIC}` CT
        JOIN `{TABLE_TOPIC}` T ON CT.ID_TOPIC = T.ID_TOPIC
        WHERE CT.ID_CONTENT = @id
        """,
        {"id": id_content}
    )

    content["events"] = query_bq(
        f"""
        SELECT E.ID_EVENT, E.LABEL
        FROM `{TABLE_CONTENT_EVENT}` CE
        JOIN `{TABLE_EVENT}` E ON CE.ID_EVENT = E.ID_EVENT
        WHERE CE.ID_CONTENT = @id
        """,
        {"id": id_content}
    )

    content["companies"] = query_bq(
        f"""
        SELECT C.ID_COMPANY, C.NAME
        FROM `{TABLE_CONTENT_COMPANY}` CC
        JOIN `{TABLE_COMPANY}` C ON CC.ID_COMPANY = C.ID_COMPANY
        WHERE CC.ID_CONTENT = @id
        """,
        {"id": id_content}
    )

    content["persons"] = query_bq(
        f"""
        SELECT P.ID_PERSON, P.NAME, CP.ROLE
        FROM `{TABLE_CONTENT_PERSON}` CP
        JOIN `{TABLE_PERSON}` P ON CP.ID_PERSON = P.ID_PERSON
        WHERE CP.ID_CONTENT = @id
        """,
        {"id": id_content}
    )

    return content


# ============================================================
# LIST CONTENTS (ADMIN)
# ============================================================
def list_contents():
    return query_bq(
        f"""
        SELECT
            ID_CONTENT,
            ANGLE_TITLE,
            EXCERPT,
            STATUS,
            DATE_CREATION,
            PUBLISHED_AT
        FROM `{TABLE_CONTENT}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY DATE_CREATION DESC
        """
    )


# ============================================================
# UPDATE CONTENT
# ============================================================
def update_content(id_content: str, data: ContentUpdate):
    if not data.angle_title.strip():
        raise ValueError("ANGLE_TITLE obligatoire")

    if not data.angle_signal.strip():
        raise ValueError("ANGLE_SIGNAL obligatoire")

    if not (
        data.topics
        or data.events
        or data.companies
        or data.persons
    ):
        raise ValueError("Un contenu doit rester associé à au moins une entité")

    fields = {
        "ANGLE_TITLE": data.angle_title,
        "ANGLE_SIGNAL": data.angle_signal,
        "EXCERPT": data.excerpt,
        "CONCEPT": data.concept,
        "CONTENT_BODY": data.content_body,

        "CITATIONS": normalize_array(data.citations),
        "CHIFFRES": normalize_array(data.chiffres),
        "ACTEURS_CITES": normalize_array(data.acteurs_cites),

        "SOURCE_TYPE": data.source_type,
        "SOURCE_TEXT": data.source_text,
        "SOURCE_URL": data.source_url,
        "SOURCE_AUTHOR": data.source_author,

        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,
        "AUTHOR": data.author,
        "DATE_CREATION": data.date_creation,
    }

    update_bq(
        table=TABLE_CONTENT,
        fields={k: v for k, v in fields.items() if v is not None},
        where={"ID_CONTENT": id_content},
    )

    client = get_bigquery_client()
    now = datetime.utcnow()

    # RESET RELATIONS
    for table in (
        TABLE_CONTENT_TOPIC,
        TABLE_CONTENT_EVENT,
        TABLE_CONTENT_COMPANY,
        TABLE_CONTENT_PERSON,
    ):
        client.query(
            f"DELETE FROM `{table}` WHERE ID_CONTENT = @id",
            job_config=None
        ).result()

    # REINSERT
    if data.topics:
        insert_bq(TABLE_CONTENT_TOPIC, [
            {"ID_CONTENT": id_content, "ID_TOPIC": tid, "CREATED_AT": now}
            for tid in data.topics
        ])

    if data.events:
        insert_bq(TABLE_CONTENT_EVENT, [
            {"ID_CONTENT": id_content, "ID_EVENT": eid, "CREATED_AT": now}
            for eid in data.events
        ])

    if data.companies:
        insert_bq(TABLE_CONTENT_COMPANY, [
            {"ID_CONTENT": id_content, "ID_COMPANY": cid, "CREATED_AT": now}
            for cid in data.companies
        ])

    if data.persons:
        insert_bq(TABLE_CONTENT_PERSON, [
            {
                "ID_CONTENT": id_content,
                "ID_PERSON": p.id_person,
                "ROLE": p.role,
                "CREATED_AT": now,
            }
            for p in data.persons
        ])

    return True


# ============================================================
# ARCHIVE CONTENT
# ============================================================
def archive_content(id_content: str):
    update_bq(
        table=TABLE_CONTENT,
        fields={"STATUS": "ARCHIVED"},
        where={"ID_CONTENT": id_content},
    )
    return True


# ============================================================
# PUBLISH CONTENT
# ============================================================
def publish_content(
    id_content: str,
    published_at: Optional[datetime] = None,
):
    now = datetime.utcnow()

    if not published_at or published_at <= now:
        update_bq(
            table=TABLE_CONTENT,
            fields={
                "STATUS": "PUBLISHED",
                "PUBLISHED_AT": now,
            },
            where={"ID_CONTENT": id_content},
        )
        return "PUBLISHED"

    update_bq(
        table=TABLE_CONTENT,
        fields={
            "STATUS": "SCHEDULED",
            "PUBLISHED_AT": published_at,
        },
        where={"ID_CONTENT": id_content},
    )
    return "SCHEDULED"
