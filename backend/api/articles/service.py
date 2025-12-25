# backend/api/articles/service.py

import uuid
from datetime import datetime
from typing import List
from backend.config import BQ_PROJECT, BQ_DATASET
from backend.utils.bigquery_utils import query_bq, insert_bq
from backend.api.articles.models import ArticleCreate, AxeItem, ArticlePersonItem

TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
TABLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_AXE"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_PERSON"


# -----------------------------------------------------
# CREATE ARTICLE
# -----------------------------------------------------

def create_article(data: ArticleCreate) -> str:
    article_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # -------------------------------------------------
    # 1) fallback visuel si companies associées
    # -------------------------------------------------
    visuel_final = data.visuel_url

    if not visuel_final and data.companies:
        # récupérer LOGO_URL du premier partenaire
        sql = f"""
            SELECT LOGO_URL
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY`
            WHERE ID_COMPANY = @id
            LIMIT 1
        """
        rows = query_bq(sql, {"id": data.companies[0]})
        if rows and rows[0].get("LOGO_URL"):
            visuel_final = rows[0]["LOGO_URL"]

    # -------------------------------------------------
    # 2) Insert Article
    # -------------------------------------------------
    row = [{
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

    insert_bq(TABLE_ARTICLE, row)

    # -------------------------------------------------
    # 3) Insert AXES
    # -------------------------------------------------
    rows_axes = [
        {
            "ID_ARTICLE": article_id,
            "AXE_TYPE": axe.type,
            "AXE_VALUE": axe.value
        }
        for axe in data.axes
    ]

    if rows_axes:
        insert_bq(TABLE_AXE, rows_axes)

    # -------------------------------------------------
    # 4) Insert COMPANIES associations
    # -------------------------------------------------
    rows_companies = [
        {"ID_ARTICLE": article_id, "ID_COMPANY": comp_id}
        for comp_id in data.companies
    ]

    if rows_companies:
        insert_bq(TABLE_COMPANY, rows_companies)

    # -------------------------------------------------
    # 5) Insert PERSON associations
    # -------------------------------------------------
    rows_persons = [
        {
            "ID_ARTICLE": article_id,
            "ID_PERSON": p.id_person,
            "ROLE": p.role
        }
        for p in data.persons
    ]

    if rows_persons:
        insert_bq(TABLE_PERSON, rows_persons)

    return article_id


# -----------------------------------------------------
# GET ARTICLE
# -----------------------------------------------------

def get_article(article_id: str) -> dict:
    sql = f"""
        SELECT *
        FROM `{TABLE_ARTICLE}`
        WHERE ID_ARTICLE = @id
        LIMIT 1
    """
    rows = query_bq(sql, {"id": article_id})
    if not rows:
        return None
    article = rows[0]

    # axes
    sql = f"""
        SELECT AXE_TYPE, AXE_VALUE
        FROM `{TABLE_AXE}`
        WHERE ID_ARTICLE = @id
    """
    article["axes"] = query_bq(sql, {"id": article_id})

    # companies
    sql = f"""
        SELECT ID_COMPANY
        FROM `{TABLE_COMPANY}`
        WHERE ID_ARTICLE = @id
    """
    article["companies"] = [r["ID_COMPANY"] for r in query_bq(sql, {"id": article_id})]

    # persons
    sql = f"""
        SELECT ID_PERSON, ROLE
        FROM `{TABLE_PERSON}`
        WHERE ID_ARTICLE = @id
    """
    article["persons"] = query_bq(sql, {"id": article_id})

    return article


# -----------------------------------------------------
# LIST ARTICLES
# -----------------------------------------------------

def list_articles(limit=50) -> List[dict]:
    sql = f"""
        SELECT *
        FROM `{TABLE_ARTICLE}`
        ORDER BY IS_FEATURED DESC, FEATURED_ORDER ASC, DATE_PUBLICATION DESC
        LIMIT @limit
    """
    return query_bq(sql, {"limit": limit})
