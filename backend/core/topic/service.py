import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client, update_bq
from api.topic.models import TopicCreate, TopicUpdate

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"


# ============================================================
# CREATE TOPIC — DATA ONLY
# ============================================================
def create_topic(data: TopicCreate) -> str:
    """
    Crée un topic.
    Aucun champ média n'est autorisé ici.
    """
    topic_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_TOPIC": topic_id,
        "LABEL": data.label,
        "DESCRIPTION": data.description,

        # ⚠️ PAS DE MEDIA AU CREATE

        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    insert_bq(TABLE_TOPIC, row)
    return topic_id


# ============================================================
# LIST TOPICS
# ============================================================
def list_topics():
    sql = f"""
        SELECT *
        FROM `{TABLE_TOPIC}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY LABEL ASC
    """
    return query_bq(sql)


# ============================================================
# GET ONE TOPIC
# ============================================================
def get_topic(topic_id: str):
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
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["UPDATED_AT"] = datetime.utcnow()

    return update_bq(
        table=TABLE_TOPIC,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_TOPIC": id_topic},
    )
