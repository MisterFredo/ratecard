import uuid
from datetime import datetime
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.event.models import EventCreate, EventUpdate

TABLE_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_EVENT"


# ============================================================
# CREATE EVENT — DATA ONLY (LOAD JOB, NO STREAMING)
# ============================================================
def create_event(data: EventCreate) -> str:
    """
    Crée un event.

    Règles :
    - aucun champ média au create
    - valeurs Home / Nav par défaut
    - insertion via LOAD JOB (pas de streaming)
    """
    event_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_EVENT": event_id,
        "LABEL": data.label,
        "DESCRIPTION": data.description,

        # Pilotage front (valeurs par défaut)
        "HOME_LABEL": None,
        "HOME_ORDER": None,
        "IS_ACTIVE_HOME": False,
        "IS_ACTIVE_NAV": False,

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
        TABLE_EVENT,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )
    job.result()  # ⬅️ bloquant = ligne immédiatement stable

    return event_id


# ============================================================
# LIST EVENTS
# ============================================================
def list_events():
    """
    Liste les events actifs (admin).
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_EVENT}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY LABEL ASC
    """
    return query_bq(sql)


# ============================================================
# GET ONE EVENT
# ============================================================
def get_event(event_id: str):
    """
    Récupère un event par ID.
    """
    sql = f"""
        SELECT *
        FROM `{TABLE_EVENT}`
        WHERE ID_EVENT = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": event_id})
    return rows[0] if rows else None


# ============================================================
# UPDATE EVENT — DATA + MEDIA + HOME/NAV
# ============================================================
def update_event(id_event: str, data: EventUpdate) -> bool:
    """
    Met à jour un event existant.

    Utilise UPDATE (pas de load job).
    """
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_EVENT,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_EVENT": id_event},
    )

