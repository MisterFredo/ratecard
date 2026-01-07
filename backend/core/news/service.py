import uuid
from datetime import datetime
from typing import Optional
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    insert_bq,
    get_bigquery_client,
    update_bq,
)

from api.news.models import NewsCreate, NewsUpdate


# ============================================================
# TABLES
# ============================================================
TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"

TABLE_NEWS_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_TOPIC"
TABLE_NEWS_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_PERSON"

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"

def serialize_row(row: dict) -> dict:
    """
    Prépare une ligne BigQuery pour un retour API (JSON-safe).
    """
    clean = {}
    for k, v in row.items():
        if hasattr(v, "isoformat"):
            clean[k] = v.isoformat()
        else:
            clean[k] = v
    return clean



# ============================================================
# CREATE NEWS
# ============================================================
def create_news(data: NewsCreate) -> str:
    """
    Crée une NEWS partenaire (sans visuel à ce stade).

    Règles métier :
    - société obligatoire
    - titre obligatoire
    - visuel NON requis à la création
    """

    if not data.id_company:
        raise ValueError("ID_COMPANY obligatoire")

    if not data.title or not data.title.strip():
        raise ValueError("TITLE obligatoire")

    news_id = str(uuid.uuid4())
    now = datetime.utcnow()

    row = [{
        "ID_NEWS": news_id,
        "STATUS": "DRAFT",
        "IS_ACTIVE": True,

        "ID_COMPANY": data.id_company,
        "TITLE": data.title,
        "BODY": data.body,

        # VISUEL (optionnel à la création)
        "MEDIA_RECTANGLE_ID": None,

        "SOURCE_URL": data.source_url,
        "AUTHOR": data.author,

        "PUBLISHED_AT": None,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()

    # INSERT VIA LOAD JOB (ANTI STREAMING BUFFER)
    client.load_table_from_json(
        row,
        TABLE_NEWS,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    # ----------------------------
    # RELATIONS — TOPICS (BADGES)
    # ----------------------------
    if data.topics:
        insert_bq(
            TABLE_NEWS_TOPIC,
            [
                {"ID_NEWS": news_id, "ID_TOPIC": tid}
                for tid in data.topics
            ],
        )

    # ----------------------------
    # RELATIONS — PERSONS
    # ----------------------------
    if data.persons:
        insert_bq(
            TABLE_NEWS_PERSON,
            [
                {"ID_NEWS": news_id, "ID_PERSON": pid}
                for pid in data.persons
            ],
        )

    return news_id


# ============================================================
# GET ONE NEWS (ENRICHI)
# ============================================================
def get_news(id_news: str):
    rows = query_bq(
        f"""
        SELECT *
        FROM `{TABLE_NEWS}`
        WHERE ID_NEWS = @id
        LIMIT 1
        """,
        {"id": id_news},
    )

    if not rows:
        return None

    news = rows[0]

    # ----------------------------
    # COMPANY
    # ----------------------------
    company = query_bq(
        f"""
        SELECT ID_COMPANY, NAME, MEDIA_LOGO_RECTANGLE_ID
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = @id
        """,
        {"id": news["ID_COMPANY"]},
    )

    news["company"] = company[0] if company else None

    # ----------------------------
    # TOPICS (BADGES)
    # ----------------------------
    news["topics"] = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL
        FROM `{TABLE_NEWS_TOPIC}` NT
        JOIN `{TABLE_TOPIC}` T ON NT.ID_TOPIC = T.ID_TOPIC
        WHERE NT.ID_NEWS = @id
        """,
        {"id": id_news},
    )

    # ----------------------------
    # PERSONS
    # ----------------------------
    news["persons"] = query_bq(
        f"""
        SELECT P.ID_PERSON, P.NAME
        FROM `{TABLE_NEWS_PERSON}` NP
        JOIN `{TABLE_PERSON}` P ON NP.ID_PERSON = P.ID_PERSON
        WHERE NP.ID_NEWS = @id
        """,
        {"id": id_news},
    )

    return news


# ============================================================
# LIST NEWS (ADMIN)
# ============================================================
def list_news():
    return query_bq(
        f"""
        SELECT
            N.ID_NEWS,
            N.TITLE,
            N.STATUS,
            N.PUBLISHED_AT,
            C.NAME AS COMPANY_NAME
        FROM `{TABLE_NEWS}` N
        JOIN `{TABLE_COMPANY}` C ON N.ID_COMPANY = C.ID_COMPANY
        WHERE N.IS_ACTIVE = TRUE
        ORDER BY N.CREATED_AT DESC
        """
    )


# ============================================================
# UPDATE NEWS
# ============================================================
def update_news(id_news: str, data: NewsUpdate):
    fields = {
        "TITLE": data.title,
        "BODY": data.body,
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,
        "SOURCE_URL": data.source_url,
        "AUTHOR": data.author,
        "UPDATED_AT": datetime.utcnow(),
    }

    update_bq(
        table=TABLE_NEWS,
        fields={k: v for k, v in fields.items() if v is not None},
        where={"ID_NEWS": id_news},
    )

    client = get_bigquery_client()

    # RESET RELATIONS
    for table in (TABLE_NEWS_TOPIC, TABLE_NEWS_PERSON):
        client.query(
            f"DELETE FROM `{table}` WHERE ID_NEWS = @id",
            job_config=None,
        ).result()

    # REINSERT RELATIONS
    if data.topics:
        insert_bq(
            TABLE_NEWS_TOPIC,
            [{"ID_NEWS": id_news, "ID_TOPIC": tid} for tid in data.topics],
        )

    if data.persons:
        insert_bq(
            TABLE_NEWS_PERSON,
            [{"ID_NEWS": id_news, "ID_PERSON": pid} for pid in data.persons],
        )

    return True


# ============================================================
# ARCHIVE NEWS
# ============================================================
def archive_news(id_news: str):
    update_bq(
        table=TABLE_NEWS,
        fields={"STATUS": "ARCHIVED"},
        where={"ID_NEWS": id_news},
    )
    return True


# ============================================================
# PUBLISH NEWS
# ============================================================
def publish_news(
    id_news: str,
    published_at: Optional[datetime] = None,
):
    """
    Publie une news.
    ⚠️ Le visuel est requis UNIQUEMENT à cette étape.
    """

    # ---------------------------------------------------------
    # CHECK VISUEL
    # ---------------------------------------------------------
    rows = query_bq(
        f"""
        SELECT MEDIA_RECTANGLE_ID
        FROM `{TABLE_NEWS}`
        WHERE ID_NEWS = @id
        """,
        {"id": id_news},
    )

    if not rows or not rows[0]["MEDIA_RECTANGLE_ID"]:
        raise ValueError("Un visuel est requis pour publier la news")

    now = datetime.utcnow()

    if not published_at or published_at <= now:
        update_bq(
            table=TABLE_NEWS,
            fields={
                "STATUS": "PUBLISHED",
                "PUBLISHED_AT": now,
            },
            where={"ID_NEWS": id_news},
        )
        return "PUBLISHED"

    update_bq(
        table=TABLE_NEWS,
        fields={
            "STATUS": "SCHEDULED",
            "PUBLISHED_AT": published_at,
        },
        where={"ID_NEWS": id_news},
    )
    return "SCHEDULED"
