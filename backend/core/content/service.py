import uuid
from datetime import datetime
from typing import Optional

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client, update_bq

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
# CREATE CONTENT — validation d’un contenu
# ============================================================
def create_content(data: ContentCreate) -> str:
    """
    Crée un contenu Ratecard.

    Règles métier :
    - angle_title obligatoire
    - angle_signal obligatoire
    - au moins UNE entité associée (topic / event / company / person)
    """
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
        raise ValueError(
            "Un contenu doit être associé à au moins une entité "
            "(topic, event, company ou person)"
        )

    content_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # ---------------------------------------------------------
    # INSERT CONTENT (DRAFT)
    # ---------------------------------------------------------
    insert_bq(TABLE_CONTENT, [{
        "ID_CONTENT": content_id,
        "STATUS": "DRAFT",
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "PUBLISHED_AT": None,
        "AUTHOR": data.author,
        "IS_ACTIVE": True,

        # SOURCE
        "SOURCE_TYPE": data.source_type,
        "SOURCE_TEXT": data.source_text,
        "SOURCE_URL": data.source_url,
        "SOURCE_AUTHOR": data.source_author,
        "SOURCE_DATE": data.source_date,

        # ANGLE
        "ANGLE_TITLE": data.angle_title,
        "ANGLE_SIGNAL": data.angle_signal,

        # CONTENT
        "EXCERPT": data.excerpt,
        "CONCEPT": data.concept,
        "CONTENT_BODY": data.content_body,

        # VISUALS
        "MEDIA_RECTANGLE_ID": None,
        "MEDIA_SQUARE_ID": None,
        "VISUAL_SOURCE_TYPE": None,
        "VISUAL_SOURCE_ID": None,

        # SEO
        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,
    }])

    # ---------------------------------------------------------
    # RELATIONS — TOPICS
    # ---------------------------------------------------------
    if data.topics:
        insert_bq(TABLE_CONTENT_TOPIC, [
            {"ID_CONTENT": content_id, "ID_TOPIC": tid, "CREATED_AT": now}
            for tid in data.topics
        ])

    # ---------------------------------------------------------
    # RELATIONS — EVENTS
    # ---------------------------------------------------------
    if data.events:
        insert_bq(TABLE_CONTENT_EVENT, [
            {"ID_CONTENT": content_id, "ID_EVENT": eid, "CREATED_AT": now}
            for eid in data.events
        ])

    # ---------------------------------------------------------
    # RELATIONS — COMPANIES
    # ---------------------------------------------------------
    if data.companies:
        insert_bq(TABLE_CONTENT_COMPANY, [
            {"ID_CONTENT": content_id, "ID_COMPANY": cid, "CREATED_AT": now}
            for cid in data.companies
        ])

    # ---------------------------------------------------------
    # RELATIONS — PERSONS (avec rôle)
    # ---------------------------------------------------------
    if data.persons:
        insert_bq(TABLE_CONTENT_PERSON, [
            {
                "ID_CONTENT": content_id,
                "ID_PERSON": p.id_person,
                "ROLE": p.role,
                "CREATED_AT": now,
            }
            for p in data.persons
        ])

    return content_id

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

    # ----------------------------
    # TOPICS
    # ----------------------------
    content["topics"] = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL
        FROM `{TABLE_CONTENT_TOPIC}` CT
        JOIN `{TABLE_TOPIC}` T ON CT.ID_TOPIC = T.ID_TOPIC
        WHERE CT.ID_CONTENT = @id
        """,
        {"id": id_content}
    )

    # ----------------------------
    # EVENTS
    # ----------------------------
    content["events"] = query_bq(
        f"""
        SELECT E.ID_EVENT, E.LABEL
        FROM `{TABLE_CONTENT_EVENT}` CE
        JOIN `{TABLE_EVENT}` E ON CE.ID_EVENT = E.ID_EVENT
        WHERE CE.ID_CONTENT = @id
        """,
        {"id": id_content}
    )

    # ----------------------------
    # COMPANIES
    # ----------------------------
    content["companies"] = query_bq(
        f"""
        SELECT C.ID_COMPANY, C.NAME
        FROM `{TABLE_CONTENT_COMPANY}` CC
        JOIN `{TABLE_COMPANY}` C ON CC.ID_COMPANY = C.ID_COMPANY
        WHERE CC.ID_CONTENT = @id
        """,
        {"id": id_content}
    )

    # ----------------------------
    # PERSONS
    # ----------------------------
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

def list_contents():
    return query_bq(
        f"""
        SELECT
            ID_CONTENT,
            ANGLE_TITLE,
            EXCERPT,
            STATUS,
            CREATED_AT,
            UPDATED_AT
        FROM `{TABLE_CONTENT}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY CREATED_AT DESC
        """
    )

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
        raise ValueError(
            "Un contenu doit être associé à au moins une entité"
        )

    now = datetime.utcnow()

    # ----------------------------
    # UPDATE CONTENT
    # ----------------------------
    fields = {
        "ANGLE_TITLE": data.angle_title,
        "ANGLE_SIGNAL": data.angle_signal,
        "EXCERPT": data.excerpt,
        "CONCEPT": data.concept,
        "CONTENT_BODY": data.content_body,
        "SOURCE_TYPE": data.source_type,
        "SOURCE_TEXT": data.source_text,
        "SOURCE_URL": data.source_url,
        "SOURCE_AUTHOR": data.source_author,
        "SOURCE_DATE": data.source_date,
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,
        "MEDIA_SQUARE_ID": data.media_square_id,
        "VISUAL_SOURCE_TYPE": data.visual_source_type,
        "VISUAL_SOURCE_ID": data.visual_source_id,
        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,
        "AUTHOR": data.author,
        "UPDATED_AT": now,
    }

    update_bq(
        table=TABLE_CONTENT,
        fields={k: v for k, v in fields.items() if v is not None},
        where={"ID_CONTENT": id_content},
    )

    # ----------------------------
    # RESET RELATIONS
    # ----------------------------
    client = get_bigquery_client()
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

    # ----------------------------
    # REINSERT RELATIONS
    # ----------------------------
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

