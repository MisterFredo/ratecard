# backend/core/articles/service.py

import uuid
from datetime import datetime

from backend.config import BQ_PROJECT, BQ_DATASET
from backend.utils.bigquery_utils import query_bq, insert_bq

from api.articles.models import ArticleCreate


TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
TABLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_AXE"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_PERSON"


# -----------------------------------------------------------
# CREATE ARTICLE
# -----------------------------------------------------------

def create_article(data: ArticleCreate) -> str:
    article_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # Fallback visuel si aucun visuel fourni
    visuel_final = data.visuel_url

    if not visuel_final and data.companies:
        sql = f"""
            SELECT LOGO_URL
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY`
            WHERE ID_COMPANY = @id
            LIMIT 1
        """
        row = query_bq(sql, {"id": data.companies[0]})
        if row and row[0].get("LOGO_URL"):
            visuel_final = row[0]["LOGO_URL"]

    # Insert ARTICLE
    row_article = [{
        "ID_ARTICLE": article_id,
        "TITRE": data.titre,
        "EXCERPT": data.excerpt,
        "CONTENU_HTML": data.contenu_html,
        "VISUEL_URL": visuel_final,
        "AUTEUR": data.auteur,
        "DATE_PUBLICATION": now,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_FEATURED": data.is_featured,
        "FEATURED_ORDER": data.featured_order,
    }]
    insert_bq(TABLE_ARTICLE, row_article)

    # Insert AXES
    rows_axes = [
        {"ID_ARTICLE": article_id, "AXE_TYPE": axe.type, "AXE_VALUE": axe.value}
        for axe in data.axes
    ]
    if rows_axes:
        insert_bq(TABLE_AXE, rows_axes)

    # Insert COMPANIES
    rows_companies = [
        {"ID_ARTICLE": article_id, "ID_COMPANY": cid}
        for cid in data.companies
    ]
    if rows_companies:
        insert_bq(TABLE_COMPANY, rows_companies)

    # Insert PERSONS
    rows_persons = [
        {"ID_ARTICLE": article_id, "ID_PERSON": p.id_person, "ROLE": p.role}
        for p in data.persons
    ]
    if rows_persons:
        insert_bq(TABLE_PERSON, rows_persons)

    return article_id


# -----------------------------------------------------------
# GET ARTICLE
# -----------------------------------------------------------

def get_article(article_id: str) -> dict:
    # ARTICLE
    article_rows = query_bq(
        f"SELECT * FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id LIMIT 1",
        {"id": article_id}
    )

    if not article_rows:
        return None

    article = article_rows[0]

    # AXES
    article["axes"] = query_bq(
        f"SELECT AXE_TYPE, AXE_VALUE FROM `{TABLE_AXE}` WHERE ID_ARTICLE = @id",
        {"id": article_id}
    )

    # COMPANIES
    rows_companies = query_bq(
        f"SELECT ID_COMPANY FROM `{TABLE_COMPANY}` WHERE ID_ARTICLE = @id",
        {"id": article_id}
    )
    article["companies"] = [c["ID_COMPANY"] for c in rows_companies]

    # PERSONS
    article["persons"] = query_bq(
        f"SELECT ID_PERSON, ROLE FROM `{TABLE_PERSON}` WHERE ID_ARTICLE = @id",
        {"id": article_id}
    )

    return article


# -----------------------------------------------------------
# LIST ARTICLES
# -----------------------------------------------------------

def list_articles(limit: int = 50):
    return query_bq(
        f"""
        SELECT *
        FROM `{TABLE_ARTICLE}`
        ORDER BY IS_FEATURED DESC, FEATURED_ORDER ASC, DATE_PUBLICATION DESC
        LIMIT @limit
        """,
        {"limit": limit}
    )
