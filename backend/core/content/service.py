import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from api.content.models import ContentCreate, ContentUpdate

from utils.bigquery_utils import (
    query_bq,
    insert_bq,
    update_bq,
    get_bigquery_client,
)

# ============================================================
# TABLES
# ============================================================

TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_EVENT"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"
TABLE_CONTENT_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_PERSON"

TABLE_CONTENT_CONCEPT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_CONCEPT"
TABLE_CONTENT_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_SOLUTION"

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_EVENT"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"
TABLE_CONCEPT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONCEPT"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"


# ============================================================
# UTILS
# ============================================================

def normalize_array(value):

    if value is None:
        return []

    if isinstance(value, list):
        return [str(v) for v in value if isinstance(v, str) and v.strip()]

    return []


# ============================================================
# CREATE CONTENT
# ============================================================

def create_content(data: ContentCreate) -> str:

    if not data.title or not data.title.strip():
        raise ValueError("TITLE obligatoire")

    if not data.content_body or not data.content_body.strip():
        raise ValueError("CONTENT_BODY obligatoire")

    content_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    row = [{
        "ID_CONTENT": content_id,
        "STATUS": "DRAFT",
        "IS_ACTIVE": True,
        "AUTHOR": data.author,

        "SOURCE_ID": data.source_id,

        "TITLE": data.title.strip(),
        "EXCERPT": data.excerpt,
        "CONTENT_BODY": data.content_body,

        "CITATIONS": normalize_array(data.citations),
        "CHIFFRES": normalize_array(data.chiffres),
        "ACTEURS_CITES": normalize_array(data.acteurs_cites),

        "CONCEPTS_LLM": normalize_array(data.concepts_llm),
        "SOLUTIONS_LLM": normalize_array(data.solutions_llm),
        "TOPICS_LLM": normalize_array(data.topics_llm),

        "MECANIQUE_EXPLIQUEE": data.mecanique_expliquee,
        "ENJEU_STRATEGIQUE": data.enjeu_strategique,
        "POINT_DE_FRICTION": data.point_de_friction,
        "SIGNAL_ANALYTIQUE": data.signal_analytique,

        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,

        "PUBLISHED_AT": None,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        TABLE_CONTENT,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    if data.topics:
        insert_bq(
            TABLE_CONTENT_TOPIC,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_TOPIC": tid,
                    "CREATED_AT": now
                }
                for tid in data.topics
            ],
        )

    if data.events:
        insert_bq(
            TABLE_CONTENT_EVENT,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_EVENT": eid,
                    "CREATED_AT": now
                }
                for eid in data.events
            ],
        )

    if data.companies:
        insert_bq(
            TABLE_CONTENT_COMPANY,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_COMPANY": cid,
                    "CREATED_AT": now
                }
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

    if data.concepts:
        insert_bq(
            TABLE_CONTENT_CONCEPT,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_CONCEPT": cid,
                    "CREATED_AT": now
                }
                for cid in data.concepts
            ],
        )

    if data.solutions:
        insert_bq(
            TABLE_CONTENT_SOLUTION,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_SOLUTION": sid,
                    "CREATED_AT": now
                }
                for sid in data.solutions
            ],
        )

    return content_id


# ============================================================
# GET CONTENT
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

    row = rows[0]

    content = {
        "id_content": row["ID_CONTENT"],
        "status": row.get("STATUS"),

        "source_id": row.get("SOURCE_ID"),

        "title": row.get("TITLE"),
        "excerpt": row.get("EXCERPT"),
        "content_body": row.get("CONTENT_BODY"),

        "citations": row.get("CITATIONS") or [],
        "chiffres": row.get("CHIFFRES") or [],
        "acteurs_cites": row.get("ACTEURS_CITES") or [],
        "concepts_llm": row.get("CONCEPTS_LLM") or [],
        "solutions_llm": row.get("SOLUTIONS_LLM") or [],
        "topics_llm": row.get("TOPICS_LLM") or [],

        "mecanique_expliquee": row.get("MECANIQUE_EXPLIQUEE"),
        "enjeu_strategique": row.get("ENJEU_STRATEGIQUE"),
        "point_de_friction": row.get("POINT_DE_FRICTION"),
        "signal_analytique": row.get("SIGNAL_ANALYTIQUE"),

        "published_at": (
            row["PUBLISHED_AT"].isoformat()
            if row.get("PUBLISHED_AT")
            else None
        ),
    }

    content["topics"] = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL, T.TOPIC_AXIS
        FROM `{TABLE_CONTENT_TOPIC}` CT
        JOIN `{TABLE_TOPIC}` T
        ON CT.ID_TOPIC = T.ID_TOPIC
        WHERE CT.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["events"] = query_bq(
        f"""
        SELECT E.ID_EVENT, E.LABEL
        FROM `{TABLE_CONTENT_EVENT}` CE
        JOIN `{TABLE_EVENT}` E
        ON CE.ID_EVENT = E.ID_EVENT
        WHERE CE.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["companies"] = query_bq(
        f"""
        SELECT C.ID_COMPANY, C.NAME
        FROM `{TABLE_CONTENT_COMPANY}` CC
        JOIN `{TABLE_COMPANY}` C
        ON CC.ID_COMPANY = C.ID_COMPANY
        WHERE CC.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["persons"] = query_bq(
        f"""
        SELECT P.ID_PERSON, P.NAME, CP.ROLE
        FROM `{TABLE_CONTENT_PERSON}` CP
        JOIN `{TABLE_PERSON}` P
        ON CP.ID_PERSON = P.ID_PERSON
        WHERE CP.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["concepts"] = query_bq(
        f"""
        SELECT C.ID_CONCEPT, C.TITLE
        FROM `{TABLE_CONTENT_CONCEPT}` CC
        JOIN `{TABLE_CONCEPT}` C
        ON CC.ID_CONCEPT = C.ID_CONCEPT
        WHERE CC.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["solutions"] = query_bq(
        f"""
        SELECT S.ID_SOLUTION, S.NAME
        FROM `{TABLE_CONTENT_SOLUTION}` CS
        JOIN `{TABLE_SOLUTION}` S
        ON CS.ID_SOLUTION = S.ID_SOLUTION
        WHERE CS.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    return content


# ============================================================
# LIST CONTENTS (PUBLIC)
# ============================================================

def list_contents():

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          TITLE,
          EXCERPT,
          PUBLISHED_AT
        FROM `{TABLE_CONTENT}`
        WHERE
          STATUS = 'PUBLISHED'
          AND IS_ACTIVE = TRUE
        ORDER BY PUBLISHED_AT DESC
        """
    )

    return rows


# ============================================================
# LIST CONTENTS ADMIN
# ============================================================

def list_contents_admin():

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          TITLE,
          STATUS,
          PUBLISHED_AT,
          UPDATED_AT
        FROM `{TABLE_CONTENT}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY UPDATED_AT DESC
        """
    )

    return rows


# ============================================================
# RESET RELATIONS
# ============================================================

def reset_and_insert(table, id_field, id_content, values):

    client = get_bigquery_client()
    now = datetime.now(timezone.utc).isoformat()

    client.query(
        f"DELETE FROM `{table}` WHERE ID_CONTENT = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter(
                    "id", "STRING", id_content
                )
            ]
        ),
    ).result()

    if values:

        insert_bq(
            table,
            [
                {
                    "ID_CONTENT": id_content,
                    id_field: v,
                    "CREATED_AT": now,
                }
                for v in values
            ],
        )


# ============================================================
# UPDATE CONTENT
# ============================================================
def update_content(id_content: str, data: ContentUpdate):

    now = datetime.now(timezone.utc).isoformat()

    fields = {
        "SOURCE_ID": data.source_id,

        "TITLE": data.title.strip() if data.title else None,
        "EXCERPT": data.excerpt,
        "CONTENT_BODY": data.content_body,

        "CITATIONS": normalize_array(data.citations) if data.citations is not None else None,
        "CHIFFRES": normalize_array(data.chiffres) if data.chiffres is not None else None,
        "ACTEURS_CITES": normalize_array(data.acteurs_cites) if data.acteurs_cites is not None else None,

        "CONCEPTS_LLM": normalize_array(data.concepts_llm) if data.concepts_llm is not None else None,
        "SOLUTIONS_LLM": normalize_array(data.solutions_llm) if data.solutions_llm is not None else None,
        "TOPICS_LLM": normalize_array(data.topics_llm) if data.topics_llm is not None else None,

        "MECANIQUE_EXPLIQUEE": data.mecanique_expliquee,
        "ENJEU_STRATEGIQUE": data.enjeu_strategique,
        "POINT_DE_FRICTION": data.point_de_friction,
        "SIGNAL_ANALYTIQUE": data.signal_analytique,

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

    reset_and_insert(
        TABLE_CONTENT_TOPIC,
        "ID_TOPIC",
        id_content,
        data.topics or [],
    )

    reset_and_insert(
        TABLE_CONTENT_EVENT,
        "ID_EVENT",
        id_content,
        data.events or [],
    )

    reset_and_insert(
        TABLE_CONTENT_COMPANY,
        "ID_COMPANY",
        id_content,
        data.companies or [],
    )

    reset_and_insert(
        TABLE_CONTENT_CONCEPT,
        "ID_CONCEPT",
        id_content,
        data.concepts or [],
    )

    reset_and_insert(
        TABLE_CONTENT_SOLUTION,
        "ID_SOLUTION",
        id_content,
        data.solutions or [],
    )

    client = get_bigquery_client()

    client.query(
        f"DELETE FROM `{TABLE_CONTENT_PERSON}` WHERE ID_CONTENT = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter(
                    "id", "STRING", id_content
                )
            ]
        ),
    ).result()

    if data.persons:
        insert_bq(
            TABLE_CONTENT_PERSON,
            [
                {
                    "ID_CONTENT": id_content,
                    "ID_PERSON": p.id_person,
                    "ROLE": p.role,
                    "CREATED_AT": now,
                }
                for p in data.persons
            ],
        )

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

    now_dt = datetime.now(timezone.utc)

    if published_at is None:
        status = "PUBLISHED"
        final_dt = now_dt
    else:
        if published_at.tzinfo is None:
            published_at = published_at.replace(
                tzinfo=timezone.utc
            )

        final_dt = published_at

        status = (
            "PUBLISHED"
            if final_dt <= now_dt
            else "SCHEDULED"
        )

    update_bq(
        table=TABLE_CONTENT,
        fields={
            "STATUS": status,
            "PUBLISHED_AT": final_dt.isoformat(),
            "UPDATED_AT": now_dt.isoformat(),
        },
        where={"ID_CONTENT": id_content},
    )

    return status

# ============================================================
# CONTENT STATS
# ============================================================

def get_content_stats():

    query = f"""
        SELECT
          COUNT(*) AS TOTAL,
          COUNTIF(STATUS = 'PUBLISHED') AS TOTAL_PUBLISHED,
          COUNTIF(STATUS = 'DRAFT') AS TOTAL_DRAFT,
          COUNTIF(
            STATUS = 'PUBLISHED'
            AND EXTRACT(YEAR FROM PUBLISHED_AT)
                = EXTRACT(YEAR FROM CURRENT_DATE())
          ) AS TOTAL_PUBLISHED_THIS_YEAR,
          COUNTIF(
            STATUS = 'PUBLISHED'
            AND EXTRACT(YEAR FROM PUBLISHED_AT)
                = EXTRACT(YEAR FROM CURRENT_DATE())
            AND EXTRACT(MONTH FROM PUBLISHED_AT)
                = EXTRACT(MONTH FROM CURRENT_DATE())
          ) AS TOTAL_PUBLISHED_THIS_MONTH
        FROM `{TABLE_CONTENT}`
    """

    rows = query_bq(query)

    return rows[0] if rows else {}
