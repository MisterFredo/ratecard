import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.articles.models import ArticleCreate

from google.cloud import bigquery


# ------------------------------------------------
# TABLE NAMES
# ------------------------------------------------
TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
TABLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_AXE"
TABLE_ARTICLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_COMPANY"
TABLE_ARTICLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_PERSON"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


# ============================================================
# CREATE ARTICLE
# ============================================================
def create_article(data: ArticleCreate) -> str:
    article_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # VISUEL LOGIC (fallback to company logo)
    visuel_final = data.visuel_url
    visuel_square_final = data.visuel_square_url

    if not visuel_final and data.companies:
        rows = query_bq(
            f"SELECT LOGO_URL FROM `{TABLE_COMPANY}` WHERE ID_COMPANY = @id LIMIT 1",
            {"id": data.companies[0]},
        )
        if rows and rows[0].get("LOGO_URL"):
            visuel_final = rows[0]["LOGO_URL"]

    insert_bq(TABLE_ARTICLE, [{
        "ID_ARTICLE": article_id,
        "TITRE": data.titre,
        "EXCERPT": data.excerpt,
        "CONTENU_HTML": data.contenu_html,
        "VISUEL_URL": visuel_final,
        "VISUEL_SQUARE_URL": visuel_square_final,
        "AUTEUR": data.auteur,
        "DATE_PUBLICATION": now,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_FEATURED": data.is_featured,
        "FEATURED_ORDER": data.featured_order,
        "IS_ARCHIVED": False,
    }])

    # Save axes
    if data.axes:
        insert_bq(TABLE_AXE, [
            {"ID_ARTICLE": article_id, "AXE_TYPE": a.type, "AXE_VALUE": a.value}
            for a in data.axes
        ])

    # Save companies
    if data.companies:
        insert_bq(TABLE_ARTICLE_COMPANY, [
            {"ID_ARTICLE": article_id, "ID_COMPANY": cid}
            for cid in data.companies
        ])

    # Save persons
    if data.persons:
        insert_bq(TABLE_ARTICLE_PERSON, [
            {"ID_ARTICLE": article_id, "ID_PERSON": p.id_person, "ROLE": p.role}
            for p in data.persons
        ])

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

    # AXES
    article["axes"] = query_bq(
        f"SELECT AXE_TYPE, AXE_VALUE FROM `{TABLE_AXE}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )

    # COMPANIES
    comps = query_bq(
        f"SELECT ID_COMPANY FROM `{TABLE_ARTICLE_COMPANY}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )
    article["companies"] = [c["ID_COMPANY"] for c in comps]

    # PERSONS
    article["persons"] = query_bq(
        f"SELECT ID_PERSON, ROLE FROM `{TABLE_ARTICLE_PERSON}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )

    return article


# ============================================================
# LIST ARTICLES
# ============================================================
def list_articles():
    sql = f"""
    WITH AXES AS (
        SELECT
            ID_ARTICLE,
            ARRAY_AGG(AXE_VALUE ORDER BY AXE_VALUE) AS AXES
        FROM `{TABLE_AXE}`
        GROUP BY ID_ARTICLE
    ),
    COMPANY AS (
        SELECT
            AC.ID_ARTICLE,
            C.NAME AS COMPANY_NAME
        FROM `{TABLE_ARTICLE_COMPANY}` AC
        LEFT JOIN `{TABLE_COMPANY}` C
        ON AC.ID_COMPANY = C.ID_COMPANY
    )

    SELECT
        A.ID_ARTICLE,
        A.TITRE,
        A.DATE_PUBLICATION,
        A.VISUEL_URL,
        A.VISUEL_SQUARE_URL,
        A.IS_FEATURED,
        A.FEATURED_ORDER,
        A.IS_ARCHIVED,
        CO.COMPANY_NAME,
        AX.AXES
    FROM `{TABLE_ARTICLE}` A
    LEFT JOIN COMPANY CO ON A.ID_ARTICLE = CO.ID_ARTICLE
    LEFT JOIN AXES AX ON A.ID_ARTICLE = AX.ID_ARTICLE
    ORDER BY A.IS_FEATURED DESC, A.FEATURED_ORDER ASC, A.DATE_PUBLICATION DESC
    """
    return query_bq(sql)


# ============================================================
# UPDATE ARTICLE
# ============================================================
def update_article(id_article: str, data: ArticleCreate):
    now = datetime.utcnow()

    client = get_bigquery_client()

    row = [{
        "ID_ARTICLE": id_article,
        "TITRE": data.titre,
        "EXCERPT": data.excerpt,
        "CONTENU_HTML": data.contenu_html,
        "VISUEL_URL": data.visuel_url,
        "VISUEL_SQUARE_URL": data.visuel_square_url,
        "AUTEUR": data.auteur,
        "UPDATED_AT": now,
        "IS_FEATURED": data.is_featured,
        "FEATURED_ORDER": data.featured_order,
    }]

    errors = client.insert_rows_json(TABLE_ARTICLE, row)
    if errors:
        raise RuntimeError(errors)

    # CLEAN relationships
    client.query(
        f"DELETE FROM `{TABLE_AXE}` WHERE ID_ARTICLE = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
        )
    ).result()

    client.query(
        f"DELETE FROM `{TABLE_ARTICLE_COMPANY}` WHERE ID_ARTICLE = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
        )
    ).result()

    client.query(
        f"DELETE FROM `{TABLE_ARTICLE_PERSON}` WHERE ID_ARTICLE = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
        )
    ).result()

    # RE-INSERT relationships
    if data.axes:
        insert_bq(TABLE_AXE, [
            {"ID_ARTICLE": id_article, "AXE_TYPE": a.type, "AXE_VALUE": a.value}
            for a in data.axes
        ])

    if data.companies:
        insert_bq(TABLE_ARTICLE_COMPANY, [
            {"ID_ARTICLE": id_article, "ID_COMPANY": cid}
            for cid in data.companies
        ])

    if data.persons:
        insert_bq(TABLE_ARTICLE_PERSON, [
            {"ID_ARTICLE": id_article, "ID_PERSON": p.id_person, "ROLE": p.role}
            for p in data.persons
        ])

    return True


# ============================================================
# DELETE + ARCHIVE
# ============================================================
def delete_article(id_article: str):
    query_bq(
        f"DELETE FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id",
        {"id": id_article},
    )
    return True


def archive_article(id_article: str):
    now = datetime.utcnow()
    row = [{
        "ID_ARTICLE": id_article,
        "IS_ARCHIVED": True,
        "UPDATED_AT": now,
    }]
    errors = insert_bq(TABLE_ARTICLE, row)
    if errors:
        raise RuntimeError(errors)
    return True
