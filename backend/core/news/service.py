import uuid
from datetime import datetime, timezone
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
TABLE_NEWS_LINKEDIN_POST = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_LINKEDIN_POST"


# ============================================================
# SERIALIZATION
# ============================================================
def serialize_row(row: dict) -> dict:
    clean = {}
    for k, v in row.items():
        if hasattr(v, "isoformat"):
            clean[k] = v.isoformat()
        else:
            clean[k] = v
    return clean


# ============================================================
# CREATE NEWS / BRÈVE
# ============================================================
def create_news(data: NewsCreate) -> str:
    if not data.id_company:
        raise ValueError("ID_COMPANY obligatoire")

    if not data.title or not data.title.strip():
        raise ValueError("TITLE obligatoire")

    # ✅ STRUCTURE
    if data.news_kind not in ("NEWS", "BRIEF"):
        raise ValueError("NEWS_KIND invalide (NEWS | BRIEF)")

    news_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_NEWS": news_id,
        "STATUS": "DRAFT",
        "IS_ACTIVE": True,

        # ✅ STRUCTURE
        "NEWS_KIND": data.news_kind,      # NEWS | BRIEF

        # ✅ CATÉGORIE RÉDACTIONNELLE
        "NEWS_TYPE": data.news_type,      # CORPORATE | PARTENAIRE | ...

        # CONTENU
        "ID_COMPANY": data.id_company,
        "TITLE": data.title,
        "EXCERPT": data.excerpt,
        "BODY": data.body if data.news_kind == "NEWS" else None,

        # VISUEL
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,
        "HAS_VISUAL": bool(data.media_rectangle_id),

        # META
        "SOURCE_URL": data.source_url,
        "AUTHOR": data.author,

        "PUBLISHED_AT": None,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()
    client.load_table_from_json(
        row,
        TABLE_NEWS,
        job_config=bigquery.LoadJobConfig(write_disposition="WRITE_APPEND"),
    ).result()

    if data.topics:
        insert_bq(
            TABLE_NEWS_TOPIC,
            [{"ID_NEWS": news_id, "ID_TOPIC": tid} for tid in data.topics],
        )

    if data.persons:
        insert_bq(
            TABLE_NEWS_PERSON,
            [{"ID_NEWS": news_id, "ID_PERSON": pid} for pid in data.persons],
        )

    return news_id


# ============================================================
# GET ONE NEWS / BRÈVE
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

    news = serialize_row(rows[0])

    company_rows = query_bq(
        f"""
        SELECT ID_COMPANY, NAME, MEDIA_LOGO_RECTANGLE_ID, IS_PARTNER
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = @id
        """,
        {"id": news["ID_COMPANY"]},
    )

    if company_rows:
        c = company_rows[0]
        news["company"] = {
            "id_company": c["ID_COMPANY"],
            "name": c["NAME"],
            "media_logo_rectangle_id": c["MEDIA_LOGO_RECTANGLE_ID"],
            "is_partner": bool(c["IS_PARTNER"]),
        }
    else:
        news["company"] = None

    news["topics"] = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL, T.TOPIC_AXIS
        FROM `{TABLE_NEWS_TOPIC}` NT
        JOIN `{TABLE_TOPIC}` T ON NT.ID_TOPIC = T.ID_TOPIC
        WHERE NT.ID_NEWS = @id
        """,
        {"id": id_news},
    )

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
# LIST NEWS / BRÈVES (PUBLIC)
# ============================================================
def list_news():
    sql = f"""
        SELECT
            n.ID_NEWS,

            -- STRUCTURE
            n.NEWS_KIND,     -- NEWS | BRIEF

            -- CATÉGORIE ÉDITORIALE
            n.NEWS_TYPE,     -- ACQUISITION / CORPORATE / ...

            -- CONTENU
            n.TITLE,
            n.EXCERPT,
            n.BODY,

            -- PUBLICATION
            n.STATUS,
            n.PUBLISHED_AT,

            -- VISUEL
            n.MEDIA_RECTANGLE_ID AS VISUAL_RECT_ID,
            n.HAS_VISUAL,

            -- SOCIÉTÉ
            c.ID_COMPANY,
            c.NAME AS COMPANY_NAME,
            c.MEDIA_LOGO_RECTANGLE_ID,
            c.IS_PARTNER,

            -- TOPICS
            T.TOPICS

        FROM `{TABLE_NEWS}` n
        JOIN `{TABLE_COMPANY}` c
          ON n.ID_COMPANY = c.ID_COMPANY

        LEFT JOIN (
            SELECT
                NT.ID_NEWS,
                ARRAY_AGG(
                    STRUCT(
                        T.LABEL AS label,
                        T.TOPIC_AXIS AS axis
                    )
                ) AS TOPICS
            FROM `{TABLE_NEWS_TOPIC}` NT
            JOIN `{TABLE_TOPIC}` T
              ON NT.ID_TOPIC = T.ID_TOPIC
            GROUP BY NT.ID_NEWS
        ) T ON n.ID_NEWS = T.ID_NEWS

        WHERE
            n.STATUS = 'PUBLISHED'
            AND n.PUBLISHED_AT IS NOT NULL
            AND n.PUBLISHED_AT <= CURRENT_TIMESTAMP()

        ORDER BY n.PUBLISHED_AT DESC
    """
    return query_bq(sql)


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================
def update_news(id_news: str, data: NewsUpdate):
    fields = {
        # ✅ STRUCTURE
        "NEWS_KIND": data.news_kind,

        # ✅ CATÉGORIE RÉDACTIONNELLE
        "NEWS_TYPE": data.news_type,

        # CONTENU
        "TITLE": data.title,
        "EXCERPT": data.excerpt,
        "BODY": data.body,

        # VISUEL
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,
        "HAS_VISUAL": (
            bool(data.media_rectangle_id)
            if data.media_rectangle_id is not None
            else None
        ),

        # META
        "SOURCE_URL": data.source_url,
        "AUTHOR": data.author,

        "UPDATED_AT": datetime.utcnow(),
    }

    update_bq(
        table=TABLE_NEWS,
        fields={k: v for k, v in fields.items() if v is not None},
        where={"ID_NEWS": id_news},
    )

    # relations (inchangées)
    client = get_bigquery_client()

    for table in (TABLE_NEWS_TOPIC, TABLE_NEWS_PERSON):
        client.query(
            f"DELETE FROM `{table}` WHERE ID_NEWS = @id",
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", id_news)
                ]
            ),
        ).result()

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
# ARCHIVE / DELETE
# ============================================================
def archive_news(id_news: str):
    update_bq(
        table=TABLE_NEWS,
        fields={"STATUS": "ARCHIVED"},
        where={"ID_NEWS": id_news},
    )
    return True


def delete_news(news_id: str):
    client = get_bigquery_client()
    queries = [
        f"DELETE FROM `{TABLE_NEWS}` WHERE ID_NEWS = @id",
        f"DELETE FROM `{TABLE_NEWS_TOPIC}` WHERE ID_NEWS = @id",
        f"DELETE FROM `{TABLE_NEWS_PERSON}` WHERE ID_NEWS = @id",
        f"DELETE FROM `{TABLE_NEWS_LINKEDIN_POST}` WHERE ID_NEWS = @id",
    ]
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", news_id)]
    )
    for q in queries:
        client.query(q, job_config=job_config).result()


# ============================================================
# PUBLISH
# ============================================================
def publish_news(id_news: str, published_at: Optional[str] = None):
    rows = query_bq(
        f"""
        SELECT
            n.NEWS_KIND,
            n.EXCERPT,
            n.MEDIA_RECTANGLE_ID,
            c.MEDIA_LOGO_RECTANGLE_ID AS COMPANY_RECT
        FROM `{TABLE_NEWS}` n
        JOIN `{TABLE_COMPANY}` c
          ON n.ID_COMPANY = c.ID_COMPANY
        WHERE n.ID_NEWS = @id
        """,
        {"id": id_news},
    )

    if not rows:
        raise ValueError("News introuvable")

    row = rows[0]

    if not row["EXCERPT"]:
        raise ValueError("Un excerpt est requis pour publier")

    if row["NEWS_KIND"] == "NEWS":
        if not row["MEDIA_RECTANGLE_ID"] and not row["COMPANY_RECT"]:
            raise ValueError("Un visuel est requis pour publier une news")

    now = datetime.now(timezone.utc)

    if published_at:
        publish_date = datetime.fromisoformat(published_at)
        if publish_date.tzinfo is None:
            publish_date = publish_date.replace(tzinfo=timezone.utc)
    else:
        publish_date = now

    status = "PUBLISHED" if publish_date <= now else "SCHEDULED"

    update_bq(
        table=TABLE_NEWS,
        fields={
            "STATUS": status,
            "PUBLISHED_AT": publish_date.isoformat(),
            "UPDATED_AT": now.isoformat(),
        },
        where={"ID_NEWS": id_news},
    )

    return status


# ============================================================
# LINKEDIN
# ============================================================
def get_news_linkedin_post(news_id: str) -> Optional[dict]:
    client = get_bigquery_client()
    rows = list(
        client.query(
            f"""
            SELECT ID_NEWS, TEXT, MODE, UPDATED_AT
            FROM `{TABLE_NEWS_LINKEDIN_POST}`
            WHERE ID_NEWS = @id
            LIMIT 1
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", news_id)
                ]
            ),
        ).result()
    )
    if not rows:
        return None
    return serialize_row(dict(rows[0]))


def save_news_linkedin_post(news_id: str, text: str, mode: str):
    client = get_bigquery_client()
    now = datetime.utcnow()

    client.query(
        f"""
        MERGE `{TABLE_NEWS_LINKEDIN_POST}` T
        USING (
            SELECT
                @id_news AS ID_NEWS,
                @text AS TEXT,
                @mode AS MODE,
                @updated_at AS UPDATED_AT
        ) S
        ON T.ID_NEWS = S.ID_NEWS
        WHEN MATCHED THEN
          UPDATE SET
            TEXT = S.TEXT,
            MODE = S.MODE,
            UPDATED_AT = S.UPDATED_AT
        WHEN NOT MATCHED THEN
          INSERT (ID_NEWS, TEXT, MODE, UPDATED_AT)
          VALUES (S.ID_NEWS, S.TEXT, S.MODE, S.UPDATED_AT)
        """,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("id_news", "STRING", news_id),
                bigquery.ScalarQueryParameter("text", "STRING", text),
                bigquery.ScalarQueryParameter("mode", "STRING", mode),
                bigquery.ScalarQueryParameter("updated_at", "TIMESTAMP", now),
            ]
        ),
    ).result()
