import uuid
from datetime import datetime
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.topic.models import TopicCreate, TopicUpdate

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_TOPIC_METRICS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC_METRICS"


# ============================================================
# CREATE TOPIC — DATA ONLY (LOAD JOB, NO STREAMING)
# ============================================================
def create_topic(data: TopicCreate) -> str:
    """
    Crée un topic.

    Règles :
    - aucun champ média au create
    - insertion via LOAD JOB (pas de streaming)
    """
    topic_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_TOPIC": topic_id,
        "LABEL": data.label,
        "TOPIC_AXIS": data.topic_axis,  # ⬅️ NOUVEAU
        "DESCRIPTION": data.description,

        # ⚠️ PAS DE MEDIA AU CREATE
        "MEDIA_SQUARE_ID": None,
        "MEDIA_RECTANGLE_ID": None,

        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    client = get_bigquery_client()
    job = client.load_table_from_json(
        row,
        TABLE_TOPIC,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )
    job.result()  # ⬅️ bloquant = ligne immédiatement stable

    return topic_id


# ============================================================
# LIST TOPICS
# ============================================================
def list_topics():
    sql = f"""
        SELECT
            t.ID_TOPIC,
            t.LABEL,
            t.TOPIC_AXIS,              -- ⬅️ NOUVEAU

            COALESCE(m.NB_ANALYSES, 0) AS NB_ANALYSES,
            COALESCE(m.LAST_30_DAYS, 0) AS DELTA_30D

        FROM {TABLE_TOPIC} t
        LEFT JOIN {TABLE_TOPIC_METRICS} m
          ON m.ID_TOPIC = t.ID_TOPIC

        WHERE t.IS_ACTIVE = TRUE

        ORDER BY NB_ANALYSES DESC, t.LABEL ASC
    """

    rows = query_bq(sql)

    return [
        {
            "ID_TOPIC": r["ID_TOPIC"],
            "LABEL": r["LABEL"],
            "TOPIC_AXIS": r.get("TOPIC_AXIS"),  # ⬅️ NOUVEAU
            "NB_ANALYSES": r["NB_ANALYSES"],
            "DELTA_30D": r["DELTA_30D"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE TOPIC
# ============================================================
def get_topic(topic_id: str):
    """
    Récupère un topic par ID.
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_TOPIC}`
        WHERE ID_TOPIC = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": topic_id})
    return rows[0] if rows else None


# ============================================================
# UPDATE TOPIC — DATA + MEDIA (POST-CREATION)
# ============================================================
def update_topic(id_topic: str, data: TopicUpdate) -> bool:
    """
    Met à jour un topic existant.

    Utilise UPDATE (pas de load job).
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_TOPIC,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_TOPIC": id_topic},
    )
