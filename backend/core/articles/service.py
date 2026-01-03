import uuid
from datetime import datetime
from typing import List

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client, update_bq
from api.articles.models import ArticleCreate, ArticleUpdate

# ============================================================
# TABLES
# ============================================================
TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
TABLE_ARTICLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_TOPIC"
TABLE_ARTICLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_COMPANY"
TABLE_ARTICLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_PERSON"

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"


# ============================================================
# CREATE ARTICLE — validation d’un draft
# ============================================================
def create_article(data: ArticleCreate) -> str:
    """
    Crée un Article à partir d’un draft validé.

    Règles :
    - title obligatoire
    - content_html obligatoire
    - au moins 1 topic obligatoire
    - visuel non obligatoire à la création
    """
    if not data.title.strip():
        raise ValueError("Le titre est obligatoire")

    if not data.content_html.strip():
        raise ValueError("Le contenu HTML est obligatoire")

    if not data.topics or len(data.topics) == 0:
        raise ValueError("Au moins un topic est obligatoire")

    article_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # ---------------------------------------------------------
    # INSERT ARTICLE (DRAFT)
    # ---------------------------------------------------------
    insert_bq(TABLE_ARTICLE, [{
        "ID_ARTICLE": article_id,
        "TITLE": data.title,
        "CONTENT_HTML": data.content_html,
        "EXCERPT": data.excerpt,
        "INTRO": data.intro,
        "OUTRO": data.outro,
        "LINKEDIN_POST_TEXT": data.linkedin_post_text,
        "CAROUSEL_CAPTION": data.carousel_caption,
        "MEDIA_RECTANGLE_ID": None,
        "MEDIA_SQUARE_ID": None,
        "AUTHOR": data.author,
        "STATUS": "DRAFT",
        "PUBLISHED_AT": None,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }])

    # ---------------------------------------------------------
    # RELATIONS — TOPICS (1..N obligatoire)
    # ---------------------------------------------------------
    topic_rows = [{
        "ID_ARTICLE": article_id,
        "ID_TOPIC": topic_id,
        "CREATED_AT": now,
    } for topic_id in data.topics]

    insert_bq(TABLE_ARTICLE_TOPIC, topic_rows)

    # ---------------------------------------------------------
    # RELATIONS — COMPANIES (0..N)
    # ---------------------------------------------------------
    if data.companies:
        company_rows = [{
            "ID_ARTICLE": article_id,
            "ID_COMPANY": cid,
            "CREATED_AT": now,
        } for cid in data.companies]
        insert_bq(TABLE_ARTICLE_COMPANY, company_rows)

    # ---------------------------------------------------------
    # RELATIONS — PERSONS (0..N + rôle)
    # ---------------------------------------------------------
    if data.persons:
        person_rows = [{
            "ID_ARTICLE": article_id,
            "ID_PERSON": p.id_person,
            "ROLE": p.role,
            "CREATED_AT": now,
        } for p in data.persons]
        insert_bq(TABLE_ARTICLE_PERSON, person_rows)

    return article_id


# ============================================================
# GET ONE ARTICLE — enrichi
# ============================================================
def get_article(id_article: str):
    rows = query_bq(
        f"""
        SELECT *
        FROM `{TABLE_ARTICLE}`
        WHERE ID_ARTICLE = @id
        LIMIT 1
        """,
        {"id": id_article}
    )

    if not rows:
        return None

    article = rows[0]

    # ---------------------------------------------------------
    # TOPICS
    # ---------------------------------------------------------
    topics = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL
        FROM `{TABLE_ARTICLE_TOPIC}` ART
        JOIN `{TABLE_TOPIC}` T ON ART.ID_TOPIC = T.ID_TOPIC
        WHERE ART.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    # ---------------------------------------------------------
    # COMPANIES
    # ---------------------------------------------------------
    companies = query_bq(
        f"""
        SELECT C.ID_COMPANY, C.NAME
        FROM `{TABLE_ARTICLE_COMPANY}` AC
        JOIN `{TABLE_COMPANY}` C ON AC.ID_COMPANY = C.ID_COMPANY
        WHERE AC.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    # ---------------------------------------------------------
    # PERSONS (avec rôle)
    # ---------------------------------------------------------
    persons = query_bq(
        f"""
        SELECT P.ID_PERSON, P.NAME, AP.ROLE
        FROM `{TABLE_ARTICLE_PERSON}` AP
        JOIN `{TABLE_PERSON}` P ON AP.ID_PERSON = P.ID_PERSON
        WHERE AP.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    article["topics"] = topics
    article["companies"] = companies
    article["persons"] = persons

    return article


# ============================================================
# LIST ARTICLES (ADMIN)
# ============================================================
def list_articles():
    return query_bq(
        f"""
        SELECT
            ID_ARTICLE,
            TITLE,
            EXCERPT,
            MEDIA_RECTANGLE_ID,
            MEDIA_SQUARE_ID,
            STATUS,
            CREATED_AT,
            UPDATED_AT
        FROM `{TABLE_ARTICLE}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY CREATED_AT DESC
        """
    )


# ============================================================
# UPDATE ARTICLE — remplacement complet
# ============================================================

def update_article(id_article: str, data: ArticleUpdate):
    if not data.title.strip():
        raise ValueError("Le titre est obligatoire")

    if not data.content_html.strip():
        raise ValueError("Le contenu HTML est obligatoire")

    if not data.topics:
        raise ValueError("Au moins un topic est obligatoire")

    now = datetime.utcnow()

    # --- ARTICLE (champs éditoriaux)
    fields = {
        "TITLE": data.title,
        "CONTENT_HTML": data.content_html,
        "EXCERPT": data.excerpt,
        "INTRO": data.intro,
        "OUTRO": data.outro,
        "LINKEDIN_POST_TEXT": data.linkedin_post_text,
        "CAROUSEL_CAPTION": data.carousel_caption,
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,
        "MEDIA_SQUARE_ID": data.media_square_id,
        "AUTHOR": data.author,
        "UPDATED_AT": now,
    }

    update_bq(
        table=TABLE_ARTICLE,
        fields={k: v for k, v in fields.items() if v is not None},
        where={"ID_ARTICLE": id_article},
    )

    # --- RELATIONS (reset propre)
    client = get_bigquery_client()
    for table in (TABLE_ARTICLE_TOPIC, TABLE_ARTICLE_COMPANY, TABLE_ARTICLE_PERSON):
        client.query(
            f"DELETE FROM `{table}` WHERE ID_ARTICLE = @id",
            job_config=None
        ).result()

    # --- RELATIONS (reinsert)
    insert_bq(TABLE_ARTICLE_TOPIC, [
        {"ID_ARTICLE": id_article, "ID_TOPIC": tid, "CREATED_AT": now}
        for tid in data.topics
    ])

    if data.companies:
        insert_bq(TABLE_ARTICLE_COMPANY, [
            {"ID_ARTICLE": id_article, "ID_COMPANY": cid, "CREATED_AT": now}
            for cid in data.companies
        ])

    if data.persons:
        insert_bq(TABLE_ARTICLE_PERSON, [
            {
                "ID_ARTICLE": id_article,
                "ID_PERSON": p.id_person,
                "ROLE": p.role,
                "CREATED_AT": now,
            }
            for p in data.persons
        ])

    return True

# ============================================================
# DELETE ARTICLE — suppression définitive
# ============================================================
def delete_article(id_article: str):
    client = get_bigquery_client()
    client.query(
        f"DELETE FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id",
        job_config={
            "query_parameters": [
                {"name": "id", "parameterType": {"type": "STRING"}, "parameterValue": {"value": id_article}},
            ]
        }
    ).result()
    return True


# ============================================================
# ARCHIVE ARTICLE — soft delete
# ============================================================
def archive_article(id_article: str):
    client = get_bigquery_client()
    now = datetime.utcnow()

    client.query(
        f"""
        UPDATE `{TABLE_ARTICLE}`
        SET
            STATUS = "ARCHIVED",
            UPDATED_AT = @now
        WHERE ID_ARTICLE = @id
        """,
        job_config={
            "query_parameters": [
                {"name": "id", "parameterType": {"type": "STRING"}, "parameterValue": {"value": id_article}},
                {"name": "now", "parameterType": {"type": "TIMESTAMP"}, "parameterValue": {"value": now}},
            ]
        }
    ).result()

    return True

# ============================================================
# PUBLISH ARTICLE
# ============================================================

def publish_article(
    id_article: str,
    published_at: datetime | None = None,
):
    """
    Publie un article immédiatement ou à une date donnée.

    - published_at = None  → publication immédiate
    - published_at != None → publication planifiée
    """

    now = datetime.utcnow()

    # Publication immédiate
    if not published_at or published_at <= now:
        update_bq(
            table=TABLE_ARTICLE,
            fields={
                "STATUS": "PUBLISHED",
                "PUBLISHED_AT": now,
                "UPDATED_AT": now,
            },
            where={"ID_ARTICLE": id_article},
        )
        return "PUBLISHED"

    # Publication planifiée
    update_bq(
        table=TABLE_ARTICLE,
        fields={
            "STATUS": "SCHEDULED",
            "PUBLISHED_AT": published_at,
            "UPDATED_AT": now,
        },
        where={"ID_ARTICLE": id_article},
    )
    return "SCHEDULED"

