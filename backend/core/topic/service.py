import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
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
    """
    Met à jour un topic existant.

    - update partiel
    - champs média autorisés
    - aucun overwrite involontaire
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    fields = []
    params = {
        "id": id_topic,
        "updated_at": datetime.utcnow(),
    }

    for field, value in values.items():
        fields.append(f"{field.upper()} = @{field}")
        params[field] = value

    sql = f"""
        UPDATE `{TABLE_TOPIC}`
        SET
            {", ".join(fields)},
            UPDATED_AT = @updated_at
        WHERE ID_TOPIC = @id
    """

    client = get_bigquery_client()
    client.query(
        sql,
        job_config={
            "query_parameters": [
                # paramètres dynamiques injectés ci-dessous
            ]
        }
    )

    client.query(
        sql,
        job_config={
            "query_parameters": [
                *[
                    {
                        "name": k,
                        "parameterType": {"type": "STRING"},
                        "parameterValue": {"value": v},
                    }
                    for k, v in params.items()
                    if k not in ("updated_at",)
                ],
                {
                    "name": "updated_at",
                    "parameterType": {"type": "TIMESTAMP"},
                    "parameterValue": {"value": params["updated_at"]},
                },
            ]
        }
    ).result()

    return True
