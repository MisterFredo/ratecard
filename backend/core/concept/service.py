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
# CREATE CONCEPT
# ============================================================
def create_concept(data: ConceptCreate) -> str:
    """
    Crée un concept métier.
    Content = HTML complet.
    """
    concept_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_CONCEPT": concept_id,
        "TITLE": data.title,
        "DESCRIPTION": data.description,
        "CONTENT": data.content,
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
    job.result()

    return concept_id


# ============================================================
# LIST CONCEPTS
# ============================================================
def list_concepts():
    """
    Liste légère pour admin.
    """
    sql = f"""
        SELECT
            ID_CONCEPT,
            TITLE,
            DESCRIPTION,
            STATUS,
            VECTORISE,
            CREATED_AT,
            UPDATED_AT
        FROM `{TABLE_CONCEPT}`
        WHERE STATUS != 'ARCHIVED'
        ORDER BY TITLE ASC
    """

    rows = query_bq(sql)

    return [
        {
            "id_concept": r["ID_CONCEPT"],
            "title": r["TITLE"],
            "description": r["DESCRIPTION"],
            "status": r["STATUS"],
            "vectorise": r["VECTORISE"],
            "created_at": r["CREATED_AT"],
            "updated_at": r["UPDATED_AT"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE CONCEPT
# ============================================================
def get_concept(concept_id: str):
    """
    Récupère un concept complet.
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_CONCEPT}`
        WHERE ID_CONCEPT = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": concept_id})

    if not rows:
        return None

    r = rows[0]

    return {
        "id_concept": r["ID_CONCEPT"],
        "title": r["TITLE"],
        "description": r.get("DESCRIPTION"),
        "content": r.get("CONTENT"),
        "status": r.get("STATUS"),
        "vectorise": r.get("VECTORISE", False),
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# UPDATE CONCEPT
# ============================================================
def update_concept(id_concept: str, data: ConceptUpdate) -> bool:
    """
    Met à jour un concept existant.
    Reset vectorise si content modifié.
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    # Si content modifié → reset vectorisation
    if "content" in values:
        values["vectorise"] = False

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_CONCEPT,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_CONCEPT": id_concept},
    )
