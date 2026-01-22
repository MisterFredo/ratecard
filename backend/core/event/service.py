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
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_CONTENT_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_EVENT"


# ============================================================
# CREATE EVENT — ADMIN
# ============================================================
def create_event(data: EventCreate) -> str:
    event_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_EVENT": event_id,
        "LABEL": data.label,
        "DESCRIPTION": data.description,

        # Pilotage front
        "HOME_LABEL": None,
        "HOME_ORDER": None,
        "IS_ACTIVE_HOME": False,
        "IS_ACTIVE_NAV": False,

        # 🎨 Signature visuelle
        "EVENT_COLOR": None,

        # 🔗 URL externe
        "EXTERNAL_URL": data.external_url,

        # Médias (IDs uniquement)
        "MEDIA_SQUARE_ID": None,
        "MEDIA_RECTANGLE_ID": None,

        # 🧭 CONTEXTE ÉVÉNEMENTIEL
        "CONTEXT_HTML": None,
        "CONTEXT_UPDATED_AT": None,
        "CONTEXT_AUTHOR": None,

        # SEO
        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,

        # Meta
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
    job.result()

    return event_id


# ============================================================
# LIST EVENTS — ADMIN
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
# GET EVENT BY ID — ADMIN
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
# UPDATE EVENT — ADMIN
# ============================================================
def update_event(id_event: str, data: EventUpdate) -> bool:
    values = data.dict(exclude_unset=True)
    if not values:
        return False

    now = datetime.utcnow().isoformat()

    # 🧭 Gestion spécifique du contexte événementiel
    if "context_html" in values:
        values["context_updated_at"] = now
        # context_author pourra être injecté plus tard

    values["updated_at"] = now

    return update_bq(
        table=TABLE_EVENT,
        fields={k.upper(): v for k, v in values.items()},
        where={"ID_EVENT": id_event},
    )


# ============================================================
# ======================  PUBLIC  ===========================
# ============================================================


# ============================================================
# GET EVENT BY SLUG — PUBLIC
# ============================================================
def get_event_by_slug(slug: str):
    rows = query_bq(
        f"""
        SELECT
          ID_EVENT,
          LABEL,
          HOME_LABEL,
          DESCRIPTION,
          MEDIA_RECTANGLE_ID,
          EVENT_COLOR,
          EXTERNAL_URL
        FROM `{TABLE_EVENT}`
        WHERE
          IS_ACTIVE = TRUE
          AND LOWER(REPLACE(HOME_LABEL, ' ', '-')) = @slug
        LIMIT 1
        """,
        {"slug": slug},
    )

    if not rows:
        return None

    e = rows[0]

    return {
        "id_event": e["ID_EVENT"],
        "label": e["LABEL"],
        "home_label": e["HOME_LABEL"],
        "description": e.get("DESCRIPTION"),
        "event_color": e.get("EVENT_COLOR"),
        "external_url": e.get("EXTERNAL_URL"),

        # 🔑 VISUEL ÉVÉNEMENT — ID UNIQUEMENT
        "visual_rect_id": e.get("MEDIA_RECTANGLE_ID"),
    }


# ============================================================
# LIST HOME EVENTS — PUBLIC (HOME + NAV)
# ============================================================
def list_home_events():
    rows = query_bq(
        f"""
        SELECT
          ID_EVENT,
          LABEL,
          HOME_LABEL,
          HOME_ORDER,
          MEDIA_RECTANGLE_ID,
          EVENT_COLOR,
          EXTERNAL_URL,
          CONTEXT_HTML
        FROM `{TABLE_EVENT}`
        WHERE
          IS_ACTIVE = TRUE
          AND IS_ACTIVE_HOME = TRUE
        ORDER BY HOME_ORDER ASC
        """
    )

    events = []
    for r in rows:
        events.append({
            "id": r["ID_EVENT"],
            "label": r["LABEL"],
            "home_label": r["HOME_LABEL"],
            "event_color": r.get("EVENT_COLOR"),
            "external_url": r.get("EXTERNAL_URL"),
            "context_html": r.get("CONTEXT_HTML"),

            # 🔑 VISUEL ÉVÉNEMENT — ID UNIQUEMENT
            "visual_rect_id": r.get("MEDIA_RECTANGLE_ID"),
        })

    return events


# ============================================================
# LIST EVENT CONTENTS — PUBLIC (ENRICHED FOR HOME)
# ============================================================
def list_event_contents(event_id: str):
    rows = query_bq(
        f"""
        SELECT
          C.ID_CONTENT,
          C.ANGLE_TITLE,
          C.EXCERPT,
          C.PUBLISHED_AT,
          C.CHIFFRES,

          T.TOPICS
        FROM `{TABLE_CONTENT_EVENT}` CE
        JOIN `{TABLE_CONTENT}` C
          ON CE.ID_CONTENT = C.ID_CONTENT

        LEFT JOIN (
          SELECT
            CT.ID_CONTENT,
            ARRAY_AGG(T.LABEL) AS TOPICS
          FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC` CT
          JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC` T
            ON CT.ID_TOPIC = T.ID_TOPIC
          GROUP BY CT.ID_CONTENT
        ) T
          ON C.ID_CONTENT = T.ID_CONTENT

        WHERE
          CE.ID_EVENT = @id
          AND C.STATUS = 'PUBLISHED'
          AND C.IS_ACTIVE = TRUE
        ORDER BY C.PUBLISHED_AT DESC
        """,
        {"id": event_id},
    )

    return [
        {
            "id": r["ID_CONTENT"],
            "title": r["ANGLE_TITLE"],
            "excerpt": r.get("EXCERPT"),
            "published_at": r["PUBLISHED_AT"],
            "topics": (r.get("TOPICS") or [])[:2],
            "key_metrics": (r.get("CHIFFRES") or [])[:2],
        }
        for r in rows
    ]





