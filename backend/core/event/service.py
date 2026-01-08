import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, update_bq
from api.event.models import EventCreate, EventUpdate

TABLE_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_EVENT"


# ============================================================
# CREATE EVENT — DATA ONLY
# ============================================================
def create_event(data: EventCreate) -> str:
    """
    Crée un event.
    Aucun champ média n'est autorisé ici.
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

    insert_bq(TABLE_EVENT, row)
    return event_id


# ============================================================
# LIST EVENTS
# ============================================================
def list_events():
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
    values = data.dict(exclude_unset=True)

    if not values:
        return False

    values["updated_at"] = datetime.utcnow().isoformat()

    return update_bq(
        table=TABLE_EVENT,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_EVENT": id_event},
    )
