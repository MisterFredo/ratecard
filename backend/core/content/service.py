import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    insert_bq,
    get_bigquery_client,
    update_bq,
)

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
def create_content(data: Dict[str, Any]) -> str:
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

    row = rows[0]

    # ---------------------------------------------------------
    # MAPPING CANONIQUE (API → FRONT)
    # ---------------------------------------------------------
    content = {
        "id_content": row["ID_CONTENT"],
        "angle_title": row["ANGLE_TITLE"],
        "angle_signal": row["ANGLE_SIGNAL"],
        "excerpt": row.get("EXCERPT"),
        "concept": row.get("CONCEPT"),
        "content_body": row.get("CONTENT_BODY"),
        "chiffres": row.get("CHIFFRES") or [],
        "citations": row.get("CITATIONS") or [],
        "acteurs_cites": row.get("ACTEURS_CITES") or [],
    }

    # ---------------------------------------------------------
    # DATE — ISO 8601
    # ---------------------------------------------------------
    published_at = row.get("PUBLISHED_AT")
    if isinstance(published_at, datetime):
        content["published_at"] = published_at.isoformat()
    else:
        content["published_at"] = None

    # ---------------------------------------------------------
    # RELATIONS
    # ---------------------------------------------------------
    content["topics"] = query_bq(
        f"""
        SELECT
            T.ID_TOPIC,
            T.LABEL,
            T.TOPIC_AXIS
        FROM `{TABLE_CONTENT_TOPIC}` CT
        JOIN `{TABLE_TOPIC}` T
          ON CT.ID_TOPIC = T.ID_TOPIC
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
    rows = query_bq(
        f"""
        SELECT
          C.ID_CONTENT,
          C.ANGLE_TITLE,
          C.ANGLE_SIGNAL,
          C.EXCERPT,
          C.CONCEPT,
          C.CONTENT_BODY,
          C.CHIFFRES,
          C.CITATIONS,
          C.ACTEURS_CITES,
          C.PUBLISHED_AT,

          E.ID_EVENT,
          E.LABEL AS EVENT_LABEL,

          T.TOPICS
        FROM `{TABLE_CONTENT}` C

        LEFT JOIN `{TABLE_CONTENT_EVENT}` CE
          ON C.ID_CONTENT = CE.ID_CONTENT
        LEFT JOIN `{TABLE_EVENT}` E
          ON CE.ID_EVENT = E.ID_EVENT

        LEFT JOIN (
          SELECT
            CT.ID_CONTENT,
            ARRAY_AGG(
              STRUCT(
                T.LABEL AS label,
                T.TOPIC_AXIS AS axis
              )
            ) AS TOPICS
          FROM `{TABLE_CONTENT_TOPIC}` CT
          JOIN `{TABLE_TOPIC}` T
            ON CT.ID_TOPIC = T.ID_TOPIC
          GROUP BY CT.ID_CONTENT
        ) T
          ON C.ID_CONTENT = T.ID_CONTENT

        WHERE
          C.STATUS = 'PUBLISHED'
          AND C.IS_ACTIVE = TRUE
        ORDER BY C.PUBLISHED_AT DESC
        """
    )

    return [
        {
            "id": r["ID_CONTENT"],
            "title": r["ANGLE_TITLE"],
            "signal": r["ANGLE_SIGNAL"],
            "excerpt": r.get("EXCERPT"),
            "concept": r.get("CONCEPT"),
            "content_body": r.get("CONTENT_BODY"),
            "chiffres": r.get("CHIFFRES") or [],
            "citations": r.get("CITATIONS") or [],
            "acteurs_cites": r.get("ACTEURS_CITES") or [],
            "topics": (r.get("TOPICS") or [])[:2],
            "published_at": r["PUBLISHED_AT"],
            "event": (
                {
                    "id": r["ID_EVENT"],
                    "label": r["EVENT_LABEL"],
                }
                if r.get("ID_EVENT")
                else None
            ),
        }
        for r in rows
    ]

# ============================================================
# LIST CONTENTS (ADMIN) — VERSION STABLE
# ============================================================
def list_contents_admin():
    rows = query_bq(
        f"""
        SELECT
          C.ID_CONTENT,
          C.ANGLE_TITLE,
          C.STATUS,
          C.PUBLISHED_AT
        FROM `{TABLE_CONTENT}` C
        WHERE
          (C.IS_ACTIVE = TRUE OR C.IS_ACTIVE IS NULL)
        ORDER BY
          C.PUBLISHED_AT DESC
        """
    )

    return [
        {
            "ID_CONTENT": r["ID_CONTENT"],
            "TITLE": r["ANGLE_TITLE"],
            "STATUS": r["STATUS"],
            "PUBLISHED_AT": r["PUBLISHED_AT"],
        }
        for r in rows
    ]


# ============================================================
# UPDATE CONTENT
# ============================================================
def update_content(id_content: str, data: Dict[str, Any]):
    ...
    # ---------------------------------------------------------
    # VALIDATIONS MÉTIER
    # ---------------------------------------------------------
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
        raise ValueError("Un contenu doit rester associé à au moins une entité")

    client = get_bigquery_client()
    now = datetime.utcnow()

    # ---------------------------------------------------------
    # 1) UPDATE TABLE_CONTENT (SANS ARRAY)
    # ---------------------------------------------------------
    fields = {
        "ANGLE_TITLE": data.angle_title,
        "ANGLE_SIGNAL": data.angle_signal,
        "EXCERPT": data.excerpt,
        "CONCEPT": data.concept,
        "CONTENT_BODY": data.content_body,

        # SOURCE
        "SOURCE_TYPE": data.source_type,
        "SOURCE_TEXT": data.source_text,
        "SOURCE_URL": data.source_url,
        "SOURCE_AUTHOR": data.source_author,

        # SEO
        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,

        # META
        "AUTHOR": data.author,
        "DATE_CREATION": data.date_creation,
    }

    update_bq(
        table=TABLE_CONTENT,
        fields={k: v for k, v in fields.items() if v is not None},
        where={"ID_CONTENT": id_content},
    )

    # ---------------------------------------------------------
    # 2) UPDATE DES COLONNES ARRAY (REQUÊTES DÉDIÉES)
    # ---------------------------------------------------------
    array_updates = {
        "CITATIONS": normalize_array(data.citations),
        "CHIFFRES": normalize_array(data.chiffres),
        "ACTEURS_CITES": normalize_array(data.acteurs_cites),
    }

    for column, values in array_updates.items():
        if values is None:
            continue

        client.query(
            f"""
            UPDATE `{TABLE_CONTENT}`
            SET {column} = @values
            WHERE ID_CONTENT = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ArrayQueryParameter(
                        "values",
                        "STRING",
                        values,
                    ),
                    bigquery.ScalarQueryParameter(
                        "id",
                        "STRING",
                        id_content,
                    ),
                ]
            ),
        ).result()

    # ---------------------------------------------------------
    # RESET RELATIONS
    # ---------------------------------------------------------
    for table in (
        TABLE_CONTENT_TOPIC,
        TABLE_CONTENT_EVENT,
        TABLE_CONTENT_COMPANY,
        TABLE_CONTENT_PERSON,
    ):
        client.query(
            f"DELETE FROM `{table}` WHERE ID_CONTENT = @id",
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "id",
                        "STRING",
                        id_content,
                    )
                ]
            ),
        ).result()

    # ---------------------------------------------------------
    # REINSERT RELATIONS
    # ---------------------------------------------------------
    if data.topics:
        insert_bq(
            TABLE_CONTENT_TOPIC,
            [
                {"ID_CONTENT": id_content, "ID_TOPIC": tid, "CREATED_AT": now}
                for tid in data.topics
            ],
        )

    if data.events:
        insert_bq(
            TABLE_CONTENT_EVENT,
            [
                {"ID_CONTENT": id_content, "ID_EVENT": eid, "CREATED_AT": now}
                for eid in data.events
            ],
        )

    if data.companies:
        insert_bq(
            TABLE_CONTENT_COMPANY,
            [
                {"ID_CONTENT": id_content, "ID_COMPANY": cid, "CREATED_AT": now}
                for cid in data.companies
            ],
        )

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
    published_at: Optional[str] = None,
):
    """
    Publie un contenu analytique à une date donnée.

    Règles :
    - si aucune date n’est fournie → publication immédiate
    - si une date est fournie (passée ou future) → elle est respectée
    - toutes les dates sont normalisées en UTC
    """

    now = datetime.now(timezone.utc)

    # ---------------------------------------------------------
    # AUCUNE DATE FOURNIE → PUBLICATION IMMÉDIATE
    # ---------------------------------------------------------
    if not published_at:
        update_bq(
            table=TABLE_CONTENT,
            fields={
                "STATUS": "PUBLISHED",
                "PUBLISHED_AT": now.isoformat(),
            },
            where={"ID_CONTENT": id_content},
        )
        return "PUBLISHED"

    # ---------------------------------------------------------
    # DATE FOURNIE → PARSING + NORMALISATION
    # ---------------------------------------------------------
    try:
        publish_date = datetime.fromisoformat(published_at)

        # datetime-local (front) → datetime naïf → UTC forcé
        if publish_date.tzinfo is None:
            publish_date = publish_date.replace(
                tzinfo=timezone.utc
            )

    except ValueError:
        raise ValueError("Format de date invalide")

    # ---------------------------------------------------------
    # STATUT EN FONCTION DE LA DATE
    # ---------------------------------------------------------
    status = "PUBLISHED" if publish_date <= now else "SCHEDULED"

    update_bq(
        table=TABLE_CONTENT,
        fields={
            "STATUS": status,
            "PUBLISHED_AT": publish_date.isoformat(),
        },
        where={"ID_CONTENT": id_content},
    )

    return status


