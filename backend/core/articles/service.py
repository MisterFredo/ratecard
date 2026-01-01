# backend/core/articles/service.py

import uuid
from datetime import datetime
from typing import List
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.articles.models import ArticleCreate, ArticleUpdate

# ------------------------------------------------
# TABLES
# ------------------------------------------------
TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
TABLE_ARTICLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_AXE"
TABLE_ARTICLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_COMPANY"
TABLE_ARTICLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_PERSON"

TABLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_AXE"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"


# ============================================================
# CREATE ARTICLE
# ============================================================
def create_article(data: ArticleCreate) -> str:
    article_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    # ---------------------------------------------------------
    # INSERT MAIN ROW — 1 VISUEL UNIQUE (rectangle)
    # ---------------------------------------------------------
    insert_bq(TABLE_ARTICLE, [{
        "ID_ARTICLE": article_id,
        "TITRE": data.titre,
        "EXCERPT": data.excerpt,
        "CONTENU_HTML": data.contenu_html,

        "MEDIA_IMAGE_URL": data.media_image_url,    # 🔥 nouveau champ unique

        "AUTEUR": data.auteur,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ARCHIVED": False,
    }])

    # ---------------------------------------------------------
    # AXES (1..N)
    # ---------------------------------------------------------
    if data.axes:
        rows = [{"ID_ARTICLE": article_id, "ID_AXE": axe_id}
                for axe_id in data.axes]
        insert_bq(TABLE_ARTICLE_AXE, rows)

    # ---------------------------------------------------------
    # COMPANIES (0..N)
    # ---------------------------------------------------------
    if data.companies:
        rows = [{"ID_ARTICLE": article_id, "ID_COMPANY": cid}
                for cid in data.companies]
        insert_bq(TABLE_ARTICLE_COMPANY, rows)

    # ---------------------------------------------------------
    # PERSONS (0..N)
    # ---------------------------------------------------------
    if data.persons:
        rows = [{"ID_ARTICLE": article_id, "ID_PERSON": pid}
                for pid in data.persons]
        insert_bq(TABLE_ARTICLE_PERSON, rows)

    return article_id


# ============================================================
# GET ONE ARTICLE
# ============================================================
def get_article(id_article: str):
    rows = query_bq(
        f"SELECT * FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id LIMIT 1",
        {"id": id_article}
    )
    if not rows:
        return None

    article = rows[0]

    # ---------------------------------------------------------
    # AXES enrichis
    # ---------------------------------------------------------
    axes = query_bq(
        f"""
        SELECT AX.ID_AXE, AX.LABEL
        FROM `{TABLE_ARTICLE_AXE}` A
        JOIN `{TABLE_AXE}` AX ON A.ID_AXE = AX.ID_AXE
        WHERE A.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    # ---------------------------------------------------------
    # COMPANY enrichie
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
    # PERSON enrichie
    # ---------------------------------------------------------
    persons = query_bq(
        f"""
        SELECT P.ID_PERSON, P.NAME
        FROM `{TABLE_ARTICLE_PERSON}` AP
        JOIN `{TABLE_PERSON}` P ON AP.ID_PERSON = P.ID_PERSON
        WHERE AP.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    article["axes"] = axes
    article["companies"] = companies
    article["persons"] = persons

    return article


# ============================================================
# LIST ARTICLES (Admin)
# ============================================================
def list_articles():
    sql = f"""
        SELECT
            ID_ARTICLE,
            TITRE,
            EXCERPT,
            MEDIA_IMAGE_URL,
            CREATED_AT,
            UPDATED_AT,
            IS_ARCHIVED
        FROM `{TABLE_ARTICLE}`
        ORDER BY CREATED_AT DESC
    """
    return query_bq(sql)


# ============================================================
# UPDATE ARTICLE
# ============================================================
def update_article(id_article: str, data: ArticleUpdate):
    now = datetime.utcnow().isoformat()
    client = get_bigquery_client()

    # ---------------------------------------------------------
    # UPSERT MAIN ARTICLE FIELDS
    # ---------------------------------------------------------
    row = [{
        "ID_ARTICLE": id_article,
        "TITRE": data.titre,
        "EXCERPT": data.excerpt,
        "CONTENU_HTML": data.contenu_html,

        "MEDIA_IMAGE_URL": data.media_image_url,    # 🔥 URL unique

        "AUTEUR": data.auteur,
        "UPDATED_AT": now,
    }]

    errors = client.insert_rows_json(TABLE_ARTICLE, row)
    if errors:
        raise RuntimeError(errors)

    # ---------------------------------------------------------
    # CLEAN RELATIONS
    # ---------------------------------------------------------
    for table in [TABLE_ARTICLE_AXE, TABLE_ARTICLE_COMPANY, TABLE_ARTICLE_PERSON]:
        client.query(
            f"DELETE FROM `{table}` WHERE ID_ARTICLE = @id",
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", id_article)
                ]
            )
        ).result()

    # ---------------------------------------------------------
    # REINSERT RELATIONS
    # ---------------------------------------------------------
    if data.axes:
        insert_bq(TABLE_ARTICLE_AXE,
                  [{"ID_ARTICLE": id_article, "ID_AXE": axe} for axe in data.axes])

    if data.companies:
        insert_bq(TABLE_ARTICLE_COMPANY,
                  [{"ID_ARTICLE": id_article, "ID_COMPANY": cid} for cid in data.companies])

    if data.persons:
        insert_bq(TABLE_ARTICLE_PERSON,
                  [{"ID_ARTICLE": id_article, "ID_PERSON": pid} for pid in data.persons])

    return True


# ============================================================
# DELETE ARTICLE
# ============================================================
def delete_article(id_article: str):
    query_bq(
        f"DELETE FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id",
        {"id": id_article},
    )
    return True


# ============================================================
# ARCHIVE ARTICLE
# ============================================================
def archive_article(id_article: str):
    now = datetime.utcnow().isoformat()
    row = [{
        "ID_ARTICLE": id_article,
        "IS_ARCHIVED": True,
        "UPDATED_AT": now,
    }]
    insert_bq(TABLE_ARTICLE, row)
    return True




