import uuid
from datetime import datetime

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq

from api.articles.models import ArticleCreate


TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
TABLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_AXE"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_PERSON"


def create_article(data: ArticleCreate) -> str:
    article_id = str(uuid.uuid4())
    now = datetime.utcnow()

    visuel_final = data.visuel_url

    if not visuel_final and data.companies:
        rows = query_bq(
            f"SELECT LOGO_URL FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY` WHERE ID_COMPANY = @id LIMIT 1",
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
        "AUTEUR": data.auteur,
        "DATE_PUBLICATION": now,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_FEATURED": data.is_featured,
        "FEATURED_ORDER": data.featured_order,
    }])

    if data.axes:
        insert_bq(TABLE_AXE, [
            {"ID_ARTICLE": article_id, "AXE_TYPE": a.type, "AXE_VALUE": a.value}
            for a in data.axes
        ])

    if data.companies:
        insert_bq(TABLE_COMPANY, [
            {"ID_ARTICLE": article_id, "ID_COMPANY": cid}
            for cid in data.companies
        ])

    if data.persons:
        insert_bq(TABLE_PERSON, [
            {"ID_ARTICLE": article_id, "ID_PERSON": p.id_person, "ROLE": p.role}
            for p in data.persons
        ])

    return article_id


def get_article(id_article: str):
    rows = query_bq(
        f"SELECT * FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id LIMIT 1",
        {"id": id_article}
    )
    if not rows:
        return None

    article = rows[0]

    article["axes"] = query_bq(
        f"SELECT AXE_TYPE, AXE_VALUE FROM `{TABLE_AXE}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )

    comps = query_bq(
        f"SELECT ID_COMPANY FROM `{TABLE_COMPANY}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )
    article["companies"] = [c["ID_COMPANY"] for c in comps]

    article["persons"] = query_bq(
        f"SELECT ID_PERSON, ROLE FROM `{TABLE_PERSON}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )

    return article


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

def update_article(id_article: str, data: ArticleCreate):
    now = datetime.utcnow()

    row = [{
        "ID_ARTICLE": id_article,
        "TITRE": data.titre,
        "EXCERPT": data.excerpt,
        "CONTENU_HTML": data.contenu_html,
        "VISUEL_URL": data.visuel_url,
        "AUTEUR": data.auteur,
        "UPDATED_AT": now,
        "IS_FEATURED": data.is_featured,
        "FEATURED_ORDER": data.featured_order,
    }]

    # Update article (MERGE)
    client = get_bigquery_client()
    table = TABLE_ARTICLE

    errors = client.insert_rows_json(table, row)
    if errors:
        raise RuntimeError(f"BigQuery update failed: {errors}")

    # Delete & reinsert axes, companies, persons
    client.query(
        f"DELETE FROM `{TABLE_AXE}` WHERE ID_ARTICLE = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
        )
    ).result()

    client.query(
        f"DELETE FROM `{TABLE_COMPANY}` WHERE ID_ARTICLE = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
        )
    ).result()

    client.query(
        f"DELETE FROM `{TABLE_PERSON}` WHERE ID_ARTICLE = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", id_article)]
        )
    ).result()

    # Insert new metadata
    if data.axes:
        insert_bq(TABLE_AXE, [
            {"ID_ARTICLE": id_article, "AXE_TYPE": a.type, "AXE_VALUE": a.value}
            for a in data.axes
        ])

    if data.companies:
        insert_bq(TABLE_COMPANY, [
            {"ID_ARTICLE": id_article, "ID_COMPANY": cid}
            for cid in data.companies
        ])

    if data.persons:
        insert_bq(TABLE_PERSON, [
            {"ID_ARTICLE": id_article, "ID_PERSON": p.id_person, "ROLE": p.role}
            for p in data.persons
        ])

    return True

def list_articles():
    sql = f"""
    SELECT
        A.ID_ARTICLE,
        A.TITRE,
        A.DATE_PUBLICATION,
        A.VISUEL_URL,
        A.IS_FEATURED,
        A.IS_ARCHIVED,
        C.NAME AS COMPANY_NAME
    FROM `{TABLE_ARTICLE}` A
    LEFT JOIN `{TABLE_COMPANY}` C
    ON A.ID_ARTICLE = C.ID_ARTICLE
    ORDER BY A.DATE_PUBLICATION DESC
    """
    return query_bq(sql)


def delete_article(id_article: str):
    query_bq(
        f"DELETE FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id",
        {"id": id_article},
    )
    return True


def archive_article(id_article: str):
    now = datetime.utcnow()
    client = get_bigquery_client()

    row = [{
        "ID_ARTICLE": id_article,
        "IS_ARCHIVED": True,
        "UPDATED_AT": now,
    }]

    errors = client.insert_rows_json(TABLE_ARTICLE, row)
    if errors:
        raise RuntimeError(errors)
    return True


