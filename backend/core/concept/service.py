import uuid
from datetime import datetime
from typing import Optional, List

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.concept.models import ConceptCreate, ConceptUpdate

TABLE_CONCEPT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONCEPT"


# ============================================================
# CREATE CONCEPT
# ============================================================
def create_concept(data: ConceptCreate) -> str:
    concept_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_CONCEPT": concept_id,
        "TITLE": data.title,
        "DESCRIPTION": data.description,
        "CONTENT": data.content,
        "STATUS": data.status or "DRAFT",
        "VECTORISE": data.vectorise or False,
        "ID_TOPIC": data.id_topic,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()
    job = client.load_table_from_json(
        row,
        TABLE_CONCEPT,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )
    job.result()

    return concept_id


# ============================================================
# LIST CONCEPTS
# ============================================================
def list_concepts(topic_ids: Optional[List[str]] = None):

    client = get_bigquery_client()

    base_sql = f"""
        SELECT
            ID_CONCEPT,
            TITLE,
            DESCRIPTION,
            STATUS,
            VECTORISE,
            ID_TOPIC,
            CREATED_AT,
            UPDATED_AT
        FROM `{TABLE_CONCEPT}`
        WHERE COALESCE(STATUS, 'DRAFT') != 'ARCHIVED'
    """

    if topic_ids:
        base_sql += " AND ID_TOPIC IN UNNEST(@topic_ids)"

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ArrayQueryParameter(
                    "topic_ids",
                    "STRING",
                    topic_ids
                )
            ]
        )

        rows = client.query(base_sql + " ORDER BY TITLE ASC", job_config=job_config).result()
    else:
        rows = query_bq(base_sql + " ORDER BY TITLE ASC")

    # 🔥 MAPPING UPPER → snake_case
    return [
        {
            "id_concept": r["ID_CONCEPT"],
            "title": r["TITLE"],
            "description": r["DESCRIPTION"],
            "status": r["STATUS"],
            "vectorise": r["VECTORISE"],
            "id_topic": r["ID_TOPIC"],
            "created_at": r["CREATED_AT"],
            "updated_at": r["UPDATED_AT"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE CONCEPT
# ============================================================
def get_concept(concept_id: str):

    sql = f"""
        SELECT
            ID_CONCEPT,
            TITLE,
            DESCRIPTION,
            CONTENT,
            STATUS,
            VECTORISE,
            ID_TOPIC,
            CREATED_AT,
            UPDATED_AT
        FROM `{TABLE_CONCEPT}`
        WHERE ID_CONCEPT = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": concept_id})

    if not rows:
        return None

    r = rows[0]

    # 🔥 MAPPING UPPER → snake_case
    return {
        "id_concept": r["ID_CONCEPT"],
        "title": r["TITLE"],
        "description": r["DESCRIPTION"],
        "content": r["CONTENT"],
        "status": r["STATUS"],
        "vectorise": r["VECTORISE"],
        "id_topic": r["ID_TOPIC"],
        "created_at": r["CREATED_AT"],
        "updated_at": r["UPDATED_AT"],
    }

# ============================================================
# UPDATE CONCEPT
# ============================================================
def update_concept(id_concept: str, data: ConceptUpdate) -> bool:
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    mapping = {
        "title": "TITLE",
        "description": "DESCRIPTION",
        "content": "CONTENT",
        "status": "STATUS",
        "vectorise": "VECTORISE",
        "id_topic": "ID_TOPIC",
    }

    bq_values = {
        mapping[k]: v
        for k, v in values.items()
        if k in mapping
    }

    if "CONTENT" in bq_values:
        bq_values["VECTORISE"] = False

    bq_values["UPDATED_AT"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_CONCEPT,
        fields=bq_values,
        where={"ID_CONCEPT": id_concept},
    )


# ============================================================
# DELETE CONCEPT
# ============================================================
def delete_concept(id_concept: str) -> bool:

    existing = query_bq(
        f"""
        SELECT ID_CONCEPT
        FROM `{TABLE_CONCEPT}`
        WHERE ID_CONCEPT = @id
        """,
        {"id": id_concept},
    )

    if not existing:
        return False

    query_bq(
        f"""
        DELETE FROM `{TABLE_CONCEPT}`
        WHERE ID_CONCEPT = @id
        """,
        {"id": id_concept},
    )

    return True
