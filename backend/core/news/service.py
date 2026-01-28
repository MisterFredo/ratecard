import uuid
from datetime import datetime
from typing import Optional
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.gcs import get_public_url
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
# SERIALIZATION (JSON-SAFE)
# ============================================================
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
    Crée une NEWS partenaire (sans publication).
    """

    if not data.id_company:
        raise ValueError("ID_COMPANY obligatoire")

    if not data.title or not data.title.strip():
        raise ValueError("TITLE obligatoire")

    news_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_NEWS": news_id,
        "STATUS": "DRAFT",
        "IS_ACTIVE": True,

        "ID_COMPANY": data.id_company,
        "TITLE": data.title,
        "BODY": data.body,
        "EXCERPT": data.excerpt,

        # VISUEL (optionnel à la création)
        "MEDIA_RECTANGLE_ID": data.media_rectangle_id,

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
    # RELATIONS — TOPICS
    # ----------------------------
    if data.topics:
        insert_bq(
            TABLE_NEWS_TOPIC,
            [{"ID_NEWS": news_id, "ID_TOPIC": tid} for tid in data.topics],
        )

    # ----------------------------
    # RELATIONS — PERSONS
    # ----------------------------
    if data.persons:
        insert_bq(
            TABLE_NEWS_PERSON,
            [{"ID_NEWS": news_id, "ID_PERSON": pid} for pid in data.persons],
        )

    return news_id


# ============================================================
# GET ONE NEWS (ENRICHI, JSON-SAFE)
# ============================================================
def get_news(id_news: str):
    # ----------------------------
    # NEWS
    # ----------------------------
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

    # ----------------------------
    # COMPANY
    # ----------------------------
    company_rows = query_bq(
        f"""
        SELECT
            ID_COMPANY,
            NAME,
            MEDIA_LOGO_RECTANGLE_ID,
            IS_PARTNER
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = @id
        """,
        {"id": news["ID_COMPANY"]},
    )

    if company_rows:
        row = company_rows[0]
        news["company"] = {
            "id_company": row["ID_COMPANY"],
            "name": row["NAME"],
            "media_logo_rectangle_id": row["MEDIA_LOGO_RECTANGLE_ID"],
            "is_partner": bool(row["IS_PARTNER"]),
        }
    else:
        news["company"] = None

    # ----------------------------
    # TOPICS (AVEC AXIS)
    # ----------------------------
    news["topics"] = query_bq(
        f"""
        SELECT
            T.ID_TOPIC,
            T.LABEL,
            T.TOPIC_AXIS
        FROM `{TABLE_NEWS_TOPIC}` NT
        JOIN `{TABLE_TOPIC}` T
          ON NT.ID_TOPIC = T.ID_TOPIC
        WHERE NT.ID_NEWS = @id
        """,
        {"id": id_news},
    )

    # ----------------------------
    # PERSONS
    # ----------------------------
    news["persons"] = query_bq(
        f"""
        SELECT
            P.ID_PERSON,
            P.NAME
        FROM `{TABLE_NEWS_PERSON}` NP
        JOIN `{TABLE_PERSON}` P
          ON NP.ID_PERSON = P.ID_PERSON
        WHERE NP.ID_NEWS = @id
        """,
        {"id": id_news},
    )

    return news

# ============================================================
# LIST NEWS (ADMIN + PUBLIC)
# ============================================================
def list_news():
    """
    Liste des news PUBLIQUES uniquement.
    """
    sql = f"""
        SELECT
            n.ID_NEWS,
            n.TITLE,
            n.EXCERPT,
            n.BODY,
            n.STATUS,
            n.PUBLISHED_AT,

            n.MEDIA_RECTANGLE_ID AS VISUAL_RECT_ID,

            c.ID_COMPANY,
            c.NAME AS COMPANY_NAME,
            c.MEDIA_LOGO_RECTANGLE_ID,
            c.IS_PARTNER,

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
        ) T
          ON n.ID_NEWS = T.ID_NEWS

        WHERE
            n.STATUS = 'PUBLISHED'
            AND n.PUBLISHED_AT IS NOT NULL
            AND n.PUBLISHED_AT <= CURRENT_TIMESTAMP()

        ORDER BY n.PUBLISHED_AT DESC
    """
    return query_bq(sql)

# ============================================================
# UPDATE NEWS
# ============================================================
def update_news(id_news: str, data: NewsUpdate):
    # ---------------------------------------------------------
    # UPDATE TABLE PRINCIPALE
    # ---------------------------------------------------------
    fields = {
        "TITLE": data.title,
        "BODY": data.body,
        "EXCERPT": data.excerpt,
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

    # ---------------------------------------------------------
    # RESET RELATIONS (AVEC PARAMÈTRE)
    # ---------------------------------------------------------
    for table in (TABLE_NEWS_TOPIC, TABLE_NEWS_PERSON):
        client.query(
            f"DELETE FROM `{table}` WHERE ID_NEWS = @id",
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "id",
                        "STRING",
                        id_news,
                    )
                ]
            ),
        ).result()

    # ---------------------------------------------------------
    # REINSERT RELATIONS
    # ---------------------------------------------------------
    if data.topics:
        insert_bq(
            TABLE_NEWS_TOPIC,
            [
                {"ID_NEWS": id_news, "ID_TOPIC": tid}
                for tid in data.topics
            ],
        )

    if data.persons:
        insert_bq(
            TABLE_NEWS_PERSON,
            [
                {"ID_NEWS": id_news, "ID_PERSON": pid}
                for pid in data.persons
            ],
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

def delete_news(news_id: str):
    client = get_bigquery_client()

    queries = [
        f"DELETE FROM `{TABLE_NEWS}` WHERE ID_NEWS = @id",
        f"DELETE FROM `{TABLE_NEWS_TOPIC}` WHERE ID_NEWS = @id",
        f"DELETE FROM `{TABLE_NEWS_PERSON}` WHERE ID_NEWS = @id",
        f"DELETE FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_LINKEDIN_POST` WHERE ID_NEWS = @id",
    ]

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("id", "STRING", news_id)
        ]
    )

    for q in queries:
        client.query(q, job_config=job_config).result()


# ============================================================
# PUBLISH NEWS
# ============================================================
def publish_news(
    id_news: str,
    published_at: Optional[str] = None,
):
    """
    Publie une news à une date donnée.
    Une news est publiable si :
    - elle a un visuel rectangle propre
    - OU sa société a un visuel rectangle
    """

    rows = query_bq(
        f"""
        SELECT
            n.MEDIA_RECTANGLE_ID AS NEWS_RECT,
            n.EXCERPT,
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

    # 🔑 VISUEL : NEWS > SOCIÉTÉ (RECTANGLE UNIQUEMENT)
    if not row["NEWS_RECT"] and not row["COMPANY_RECT"]:
        raise ValueError(
            "Un visuel rectangulaire est requis pour publier la news"
        )

    if not row["EXCERPT"]:
        raise ValueError("Un excerpt est requis pour publier la news")

    now = datetime.utcnow()

    # ---------------------------------------------------------
    # Détermination de la date de publication
    # ---------------------------------------------------------
    if published_at:
        try:
            publish_date = datetime.fromisoformat(published_at)
        except ValueError:
            raise ValueError("Format de date invalide")
    else:
        publish_date = now

    # ---------------------------------------------------------
    # Statut en fonction de la date
    # ---------------------------------------------------------
    if publish_date <= now:
        update_bq(
            table=TABLE_NEWS,
            fields={
                "STATUS": "PUBLISHED",
                "PUBLISHED_AT": publish_date.isoformat(),
                "UPDATED_AT": now.isoformat(),
            },
            where={"ID_NEWS": id_news},
        )
        return "PUBLISHED"

    update_bq(
        table=TABLE_NEWS,
        fields={
            "STATUS": "SCHEDULED",
            "PUBLISHED_AT": publish_date.isoformat(),
            "UPDATED_AT": now.isoformat(),
        },
        where={"ID_NEWS": id_news},
    )
    return "SCHEDULED"

# ============================================================
# LINKEDIN — GET POST FOR NEWS
# ============================================================

def get_news_linkedin_post(news_id: str) -> Optional[dict]:
    """
    Récupère le post LinkedIn associé à une news.
    Retourne None si inexistant.
    """
    client = get_bigquery_client()

    query = f"""
        SELECT
            ID_NEWS,
            TEXT,
            MODE,
            UPDATED_AT
        FROM `{TABLE_NEWS_LINKEDIN_POST}`
        WHERE ID_NEWS = @news_id
        LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter(
                "news_id", "STRING", news_id
            )
        ]
    )

    rows = list(client.query(query, job_config=job_config).result())

    if not rows:
        return None

    return serialize_row(dict(rows[0]))

# ============================================================
# LINKEDIN — SAVE / UPDATE POST FOR NEWS
# ============================================================

def save_news_linkedin_post(
    news_id: str,
    text: str,
    mode: str,
):
    """
    Sauvegarde ou met à jour le post LinkedIn lié à une news.
    Utilise un MERGE BigQuery (UPSERT).
    """
    client = get_bigquery_client()

    now = datetime.utcnow()

    query = f"""
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
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter(
                "id_news", "STRING", news_id
            ),
            bigquery.ScalarQueryParameter(
                "text", "STRING", text
            ),
            bigquery.ScalarQueryParameter(
                "mode", "STRING", mode
            ),
            bigquery.ScalarQueryParameter(
                "updated_at", "TIMESTAMP", now
            ),
        ]
    )

    client.query(query, job_config=job_config).result()



