import uuid
from datetime import datetime
from typing import Optional, List

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, insert_bq, get_bigquery_client
from api.articles.models import ArticleCreate, ArticleUpdate

from google.cloud import bigquery


# =====================================================================
# TABLES
# =====================================================================
TABLE_ARTICLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE"
TABLE_ARTICLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_COMPANY"
TABLE_ARTICLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_PERSON"
TABLE_ARTICLE_AXE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ARTICLE_AXE"


# =====================================================================
# HELPERS
# =====================================================================

def _insert_join(table: str, id_article: str, ids: List[str], col: str):
    """
    Inserts relations N:N into join tables.
    """
    if not ids:
        return

    rows = [
        {
            "ID_ARTICLE": id_article,
            col: _id,
            "CREATED_AT": datetime.utcnow().isoformat(),
        }
        for _id in ids
    ]

    errors = insert_bq(table, rows)
    if errors:
        raise RuntimeError(f"Insertion join failed: {errors}")


def _delete_join(table: str, id_article: str):
    """
    Deletes previous relations for an article.
    """
    client = get_bigquery_client()

    sql = f"DELETE FROM `{table}` WHERE ID_ARTICLE = @id"

    client.query(
        sql,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("id", "STRING", id_article)
            ]
        )
    ).result()


# =====================================================================
# CREATE ARTICLE
# =====================================================================

def create_article(payload: ArticleCreate) -> str:
    """
    Creates article + relations + visual IDs.
    """
    id_article = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_ARTICLE": id_article,
        "TITLE": payload.title,
        "EXCERPT": payload.excerpt,
        "CONTENT_HTML": payload.content_html,

        # VISUELS → IDs GCS
        "MEDIA_RECTANGLE_ID": payload.media_rectangle_id,
        "MEDIA_SQUARE_ID": payload.media_square_id,

        "AUTHOR": payload.author,

        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    errors = insert_bq(TABLE_ARTICLE, row)
    if errors:
        raise RuntimeError(errors)

    # relations
    _insert_join(TABLE_ARTICLE_COMPANY, id_article, payload.companies, "ID_COMPANY")
    _insert_join(TABLE_ARTICLE_PERSON, id_article, [p.id_person for p in payload.persons], "ID_PERSON")
    _insert_join(TABLE_ARTICLE_AXE, id_article, payload.axes, "ID_AXE")

    return id_article


# =====================================================================
# GET ARTICLE FULL
# =====================================================================

def get_article(id_article: str):
    """
    Returns a fully enriched article: article + companies + persons + axes.
    """
    rows = query_bq(
        f"SELECT * FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )
    if not rows:
        return None

    a = rows[0]

    companies = query_bq(
        f"SELECT ID_COMPANY FROM `{TABLE_ARTICLE_COMPANY}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )
    persons = query_bq(
        f"SELECT ID_PERSON FROM `{TABLE_ARTICLE_PERSON}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )
    axes = query_bq(
        f"SELECT ID_AXE FROM `{TABLE_ARTICLE_AXE}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )

    a["companies"] = [c["ID_COMPANY"] for c in companies]
    a["persons"] = [p["ID_PERSON"] for p in persons]
    a["axes"] = [x["ID_AXE"] for x in axes]

    return a


# =====================================================================
# LIST ARTICLES (SUMMARY)
# =====================================================================

def list_articles():
    """
    Returns all articles with basic metadata + joined axes & company names.
    """
    sql = f"""
    WITH AXES AS (
        SELECT
            ID_ARTICLE,
            ARRAY_AGG(ID_AXE ORDER BY ID_AXE) AS AXES
        FROM `{TABLE_ARTICLE_AXE}`
        GROUP BY ID_ARTICLE
    ),
    COMPANIES AS (
        SELECT
            AC.ID_ARTICLE,
            ARRAY_AGG(C.NAME ORDER BY C.NAME) AS COMPANIES
        FROM `{TABLE_ARTICLE_COMPANY}` AC
        LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY` C
            ON AC.ID_COMPANY = C.ID_COMPANY
        GROUP BY AC.ID_ARTICLE
    )

    SELECT
        A.*,
        IFNULL(AX.AXES, []) AS AXES,
        IFNULL(CO.COMPANIES, []) AS COMPANIES
    FROM `{TABLE_ARTICLE}` A
    LEFT JOIN AXES AX ON A.ID_ARTICLE = AX.ID_ARTICLE
    LEFT JOIN COMPANIES CO ON A.ID_ARTICLE = CO.ID_ARTICLE
    WHERE A.IS_ACTIVE = TRUE
    ORDER BY A.CREATED_AT DESC
    """

    return query_bq(sql)


# =====================================================================
# UPDATE ARTICLE
# =====================================================================

def update_article(id_article: str, payload: ArticleUpdate):
    """
    Updates article + resets and reinserts relations.
    """
    client = get_bigquery_client()
    now = datetime.utcnow().isoformat()

    fields = []
    params = {"id": id_article, "now": now}

    if payload.title is not None:
        fields.append("TITLE = @title")
        params["title"] = payload.title

    if payload.excerpt is not None:
        fields.append("EXCERPT = @excerpt")
        params["excerpt"] = payload.excerpt

    if payload.content_html is not None:
        fields.append("CONTENT_HTML = @html")
        params["html"] = payload.content_html

    if payload.media_rectangle_id is not None:
        fields.append("MEDIA_RECTANGLE_ID = @rect")
        params["rect"] = payload.media_rectangle_id

    if payload.media_square_id is not None:
        fields.append("MEDIA_SQUARE_ID = @square")
        params["square"] = payload.media_square_id

    if payload.author is not None:
        fields.append("AUTHOR = @author")
        params["author"] = payload.author

    fields.append("UPDATED_AT = @now")

    sql = f"""
        UPDATE `{TABLE_ARTICLE}`
        SET {", ".join(fields)}
        WHERE ID_ARTICLE = @id
    """

    client.query(
        sql,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter(name, "STRING", value)
                for name, value in params.items()
            ]
        )
    ).result()

    # relations update
    if payload.companies is not None:
        _delete_join(TABLE_ARTICLE_COMPANY, id_article)
        _insert_join(TABLE_ARTICLE_COMPANY, id_article, payload.companies, "ID_COMPANY")

    if payload.persons is not None:
        _delete_join(TABLE_ARTICLE_PERSON, id_article)
        _insert_join(TABLE_ARTICLE_PERSON, id_article, [p.id_person for p in payload.persons], "ID_PERSON")

    if payload.axes is not None:
        _delete_join(TABLE_ARTICLE_AXE, id_article)
        _insert_join(TABLE_ARTICLE_AXE, id_article, payload.axes, "ID_AXE")

    return True


# =====================================================================
# DELETE / ARCHIVE
# =====================================================================

def delete_article(id_article: str):
    """
    Hard delete.
    """
    query_bq(
        f"DELETE FROM `{TABLE_ARTICLE}` WHERE ID_ARTICLE = @id",
        {"id": id_article}
    )
    return True


def archive_article(id_article: str):
    """
    Soft delete.
    """
    now = datetime.utcnow().isoformat()
    row = [{
        "ID_ARTICLE": id_article,
        "IS_ACTIVE": False,
        "UPDATED_AT": now,
    }]
    insert_bq(TABLE_ARTICLE, row)
    return True
