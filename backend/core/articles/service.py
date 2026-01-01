# backend/core/articles/service.py

import uuid
from datetime import datetime
from typing import List

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.articles.models import ArticleCreate, ArticleUpdate

from google.cloud import bigquery


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
TABLE_MEDIA = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"

# ============================================================
# CREATE ARTICLE
# ============================================================
def create_article(data: ArticleCreate) -> str:
    article_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # ------------------------------------------------------------------
    # VISUEL — aucun calcul ici : le front a déjà choisi (media override)
    # ------------------------------------------------------------------
    rect_id = data.media_rectangle_id
    square_id = data.media_square_id

    # ------------------------------------------------------------------
    # INSERT MAIN ARTICLE ROW
    # ------------------------------------------------------------------
    insert_bq(TABLE_ARTICLE, [{
        "ID_ARTICLE": article_id,
        "TITRE": data.titre,
        "RESUME": data.resume,
        "CONTENU_HTML": data.contenu_html,

        "MEDIA_RECTANGLE_ID": rect_id,
        "MEDIA_SQUARE_ID": square_id,

        "AUTEUR": data.auteur,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_FEATURED": data.is_featured,
        "FEATURED_ORDER": data.featured_order,
        "IS_ARCHIVED": False,
    }])

    # ------------------------------------------------------------------
    # AXES (1..N)
    # ------------------------------------------------------------------
    if data.axes:
        rows = [{"ID_ARTICLE": article_id, "ID_AXE": axe_id}
                for axe_id in data.axes]
        insert_bq(TABLE_ARTICLE_AXE, rows)

    # ------------------------------------------------------------------
    # COMPANIES (0..N)
    # ------------------------------------------------------------------
    if data.companies:
        rows = [{"ID_ARTICLE": article_id, "ID_COMPANY": cid}
                for cid in data.companies]
        insert_bq(TABLE_ARTICLE_COMPANY, rows)

    # ------------------------------------------------------------------
    # PERSONS (0..N)
    # ------------------------------------------------------------------
    if data.persons:
        rows = [{
            "ID_ARTICLE": article_id,
            "ID_PERSON": p.id_person,
            "ROLE": p.role
        } for p in data.persons]
        insert_bq(TABLE_ARTICLE_PERSON, rows)

    return article_id

# ============================================================
# GET ONE ARTICLE
# ============================================================
def get_article(id_article: str):
    # Article
    rows = query_bq(
        f"SELECT * FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id LIMIT 1",
        {"id": id_article}
    )
    if not rows:
        return None

    article = rows[0]

    # AXES enrichis
    axes = query_bq(
        f"""
        SELECT AX.ID_AXE, AX.LABEL
        FROM `{TABLE_ARTICLE_AXE}` A
        JOIN `{TABLE_AXE}` AX ON A.ID_AXE = AX.ID_AXE
        WHERE A.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    # COMPANIES enrichies
    companies = query_bq(
        f"""
        SELECT C.ID_COMPANY, C.NAME
        FROM `{TABLE_ARTICLE_COMPANY}` A
        JOIN `{TABLE_COMPANY}` C ON A.ID_COMPANY = C.ID_COMPANY
        WHERE A.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    # PERSONS enrichies
    persons = query_bq(
        f"""
        SELECT P.ID_PERSON, P.NAME, A.ROLE
        FROM `{TABLE_ARTICLE_PERSON}` A
        JOIN `{TABLE_PERSON}` P ON A.ID_PERSON = P.ID_PERSON
        WHERE A.ID_ARTICLE = @id
        """,
        {"id": id_article}
    )

    # MEDIA direct → fichier GCS
    media_rect = None
    media_square = None

    if article.get("MEDIA_RECTANGLE_ID"):
        r = query_bq(
            f"SELECT FILEPATH FROM `{TABLE_MEDIA}` WHERE ID_MEDIA = @id",
            {"id": article["MEDIA_RECTANGLE_ID"]}
        )
        if r:
            media_rect = r[0]["FILEPATH"]

    if article.get("MEDIA_SQUARE_ID"):
        r = query_bq(
            f"SELECT FILEPATH FROM `{TABLE_MEDIA}` WHERE ID_MEDIA = @id",
            {"id": article["MEDIA_SQUARE_ID"]}
        )
        if r:
            media_square = r[0]["FILEPATH"]

    article["axes"] = axes
    article["companies"] = companies
    article["persons"] = persons
    article["media_rectangle_path"] = media_rect
    article["media_square_path"] = media_square

    return article


# ============================================================
# LIST ARTICLES
# ============================================================
def list_articles():
    sql = f"""
    SELECT
        A.ID_ARTICLE,
        A.TITRE,
        A.RESUME,
        A.CREATED_AT,
        A.IS_FEATURED,
        A.FEATURED_ORDER,
        A.IS_ARCHIVED,
        A.MEDIA_RECTANGLE_ID,
        A.MEDIA_SQUARE_ID
    FROM `{TABLE_ARTICLE}` A
    ORDER BY A.CREATED_AT DESC
    """
    return query_bq(sql)


# ============================================================
# UPDATE ARTICLE
# ============================================================
def update_article(id_article: str, data: ArticleUpdate):
    now = datetime.utcnow()
    client = get_bigquery_client()

    # BigQuery UPSERT (INSERT avec même ID)
    row = [{
        "ID_ARTICLE": id_article,
        "TITRE": data.titre,
        "RESUME": data.resume,
        "CONTENU_HTML": data.contenu_html,
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,
        "MEDIA_SQUARE_ID": data.media_square_id,
        "AUTEUR": data.auteur,
        "UPDATED_AT": now,
        "IS_FEATURED": data.is_featured,
        "FEATURED_ORDER": data.featured_order,
    }]

    errors = client.insert_rows_json(TABLE_ARTICLE, row)
    if errors:
        raise RuntimeError(errors)

    # CLEAN RELATIONS
    for table in [TABLE_ARTICLE_AXE, TABLE_ARTICLE_COMPANY, TABLE_ARTICLE_PERSON]:
        client.query(
            f"DELETE FROM `{table}` WHERE ID_ARTICLE = @id",
            job_config=bigquery.QueryJobConfig(
                query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
            )
        ).result()

    # RE-INSERT RELATIONS
    if data.axes:
        insert_bq(TABLE_ARTICLE_AXE,
                  [{"ID_ARTICLE": id_article, "ID_AXE": axe} for axe in data.axes])

    if data.companies:
        insert_bq(TABLE_ARTICLE_COMPANY,
                  [{"ID_ARTICLE": id_article, "ID_COMPANY": cid} for cid in data.companies])

    if data.persons:
        insert_bq(TABLE_ARTICLE_PERSON,
                  [{"ID_ARTICLE": id_article, "ID_PERSON": p.id_person, "ROLE": p.role}
                   for p in data.persons])

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
    now = datetime.utcnow()
    row = [{
        "ID_ARTICLE": id_article,
        "IS_ARCHIVED": True,
        "UPDATED_AT": now,
    }]
    insert_bq(TABLE_ARTICLE, row)
    return True



