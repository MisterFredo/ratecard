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
# CREATE CONCEPT — LOAD JOB (NO STREAMING)
# ============================================================
def create_concept(data: ConceptCreate) -> str:
    """
    Crée un concept métier.

    Insertion via LOAD JOB (ligne immédiatement stable).
    """
    concept_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_CONCEPT": concept_id,
        "TITLE": data.title,
        "DESCRIPTION": data.description,
        "BLOCKS": data.blocks,
        "STATUS": data.status or "DRAFT",
        "VECTORISE": data.vectorise or False,
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
    job.result()  # ⬅️ bloquant = stable immédiatement

    return concept_id


# ============================================================
# LIST CONCEPTS
# ============================================================
def list_concepts():
    sql = f"""
        SELECT
            ID_CONCEPT,
            TITLE,
            STATUS,
            VECTORISE,
            CREATED_AT,
            UPDATED_AT
        FROM {TABLE_CONCEPT}
        WHERE STATUS != 'ARCHIVED'
        ORDER BY TITLE ASC
    """

    rows = query_bq(sql)

    return [
        {
            "ID_CONCEPT": r["ID_CONCEPT"],
            "TITLE": r["TITLE"],
            "STATUS": r["STATUS"],
            "VECTORISE": r["VECTORISE"],
            "CREATED_AT": r["CREATED_AT"],
            "UPDATED_AT": r["UPDATED_AT"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE CONCEPT
# ============================================================
def get_concept(concept_id: str):
    """
    Récupère un concept par ID.
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_CONCEPT}`
        WHERE ID_CONCEPT = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": concept_id})
    return rows[0] if rows else None


# ============================================================
# UPDATE CONCEPT
# ============================================================
def update_concept(id_concept: str, data: ConceptUpdate) -> bool:
    """
    Met à jour un concept existant.
    Utilise UPDATE (pas de load job).
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_CONCEPT,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_CONCEPT": id_concept},
    )
