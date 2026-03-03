import uuid
from datetime import datetime
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
# CREATE CONCEPT — MAJUSCULES + ID_TOPIC
# ============================================================
def create_concept(data: ConceptCreate) -> str:
    concept_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_CONCEPT": concept_id,
        "TITLE": data.TITLE,
        "DESCRIPTION": data.DESCRIPTION,
        "CONTENT": data.CONTENT,
        "STATUS": data.STATUS or "DRAFT",
        "VECTORISE": data.VECTORISE or False,
        "ID_TOPIC": data.ID_TOPIC,  # 🔥 mono-topic
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
# LIST CONCEPTS — MAJUSCULES + ID_TOPIC
# ============================================================
def list_concepts():
    sql = f"""
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
        ORDER BY TITLE ASC
    """

    return query_bq(sql)  # ⚠️ brut BQ


# ============================================================
# GET ONE CONCEPT — MAJUSCULES + ID_TOPIC
# ============================================================
def get_concept(concept_id: str):
    sql = f"""
        SELECT *
        FROM `{TABLE_CONCEPT}`
        WHERE ID_CONCEPT = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": concept_id})

    if not rows:
        return None

    return rows[0]  # ⚠️ brut BQ


# ============================================================
# UPDATE CONCEPT — MAJUSCULES + ID_TOPIC
# ============================================================
def update_concept(id_concept: str, data: ConceptUpdate) -> bool:
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    # Si CONTENT modifié → reset VECTORISE
    if "CONTENT" in values:
        values["VECTORISE"] = False

    values["UPDATED_AT"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_CONCEPT,
        fields=values,  # ⚠️ plus de .upper()
        where={"ID_CONCEPT": id_concept},
    )

def delete_concept(id_concept: str) -> bool:
    """
    Supprime physiquement un concept.
    Retourne True si supprimé.
    """

    from utils.bigquery_utils import delete_bq

    deleted = delete_bq(
        table=TABLE_CONCEPT,
        where={"ID_CONCEPT": id_concept},
    )

    return deleted
