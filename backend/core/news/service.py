import uuid
from datetime import datetime, timezone
from typing import Optional, List
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

    client = get_bigquery_client()

    # ============================================================
    # 🔥 FALLBACK VISUEL SOCIÉTÉ
    # ============================================================

    media_id = data.media_rectangle_id

    if not media_id:
        query = f"""
            SELECT MEDIA_LOGO_RECTANGLE_ID
            FROM `{TABLE_COMPANY}`
            WHERE ID_COMPANY = @company_id
            LIMIT 1
        """

        job = client.query(
            query,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "company_id", "STRING", data.id_company
                    )
                ]
            )
        )

        result = list(job.result())

        if result and result[0].MEDIA_LOGO_RECTANGLE_ID:
            media_id = result[0].MEDIA_LOGO_RECTANGLE_ID

    # ============================================================
    # INSERT NEWS
    # ============================================================

    row = [{
        "ID_NEWS": news_id,
        "STATUS": "DRAFT",
        "IS_ACTIVE": True,

        # STRUCTURE
        "NEWS_KIND": data.news_kind,  # NEWS | BRIEF

        # CATÉGORIE RÉDACTIONNELLE
        "NEWS_TYPE": data.news_type,

        # CONTENU
        "ID_COMPANY": data.id_company,
        "TITLE": data.title,
        "EXCERPT": data.excerpt,
        "BODY": data.body if data.news_kind == "NEWS" else None,

        # VISUEL (toujours rempli après fallback)
        "MEDIA_RECTANGLE_ID": media_id,
        "HAS_VISUAL": bool(media_id),

        # META
        "SOURCE_URL": data.source_url,
        "AUTHOR": data.author,

        "PUBLISHED_AT": None,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client.load_table_from_json(
        row,
        TABLE_NEWS,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    # ============================================================
    # RELATIONS
    # ============================================================

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
# DUPLICATE COMPANY VISUAL FOR NEWS
# ============================================================

def duplicate_company_visual_for_news(id_news: str, company_media_id: str) -> str:
    from google.cloud import storage
    from google.oauth2 import service_account
    import os
    import json

    if not company_media_id or not company_media_id.startswith("COMPANY_"):
        raise ValueError("MEDIA société invalide")

    credentials_path = os.environ.get("GOOGLE_CREDENTIALS_FILE")
    if not credentials_path:
        raise ValueError("GOOGLE_CREDENTIALS_FILE non défini")

    with open(credentials_path, "r") as f:
        info = json.load(f)

    credentials = service_account.Credentials.from_service_account_info(info)

    storage_client = storage.Client(
        credentials=credentials,
        project=info.get("project_id"),
    )

    bucket = storage_client.bucket("ratecard-media")

    source_blob = bucket.blob(f"companies/{company_media_id}")

    if not source_blob.exists():
        raise ValueError("Fichier société introuvable")

    new_filename = f"NEWS_{id_news}_rect.jpg"
    destination_blob = bucket.blob(f"news/{new_filename}")

    destination_blob.rewrite(source_blob)

    # Update BQ
    update_bq(
        TABLE_NEWS,
        fields={
            "MEDIA_RECTANGLE_ID": new_filename,
            "HAS_VISUAL": True,
        },
        where={"ID_NEWS": id_news},
    )

    return new_filename
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
def list_news(news_kind: str | None = None):
    where_kind = ""
    if news_kind:
        where_kind = f"AND n.NEWS_KIND = '{news_kind}'"

    sql = f"""
        SELECT
            n.ID_NEWS,
            n.NEWS_KIND,
            n.NEWS_TYPE,
            n.TITLE,
            n.EXCERPT,
            n.BODY,
            n.STATUS,
            n.PUBLISHED_AT,
            n.MEDIA_RECTANGLE_ID AS VISUAL_RECT_ID,
            n.HAS_VISUAL,
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
        ) T ON n.ID_NEWS = T.ID_NEWS

        WHERE
            n.STATUS = 'PUBLISHED'
            AND n.PUBLISHED_AT IS NOT NULL
            AND n.PUBLISHED_AT <= CURRENT_TIMESTAMP()
            {where_kind}

        ORDER BY n.PUBLISHED_AT DESC
    """

    return query_bq(sql)
# ============================================================
# NEWS TYPES (RÉFÉRENTIEL ÉDITORIAL)
# ============================================================

def list_news_types():
    rows = query_bq(
        f"""
        SELECT CODE, LABEL
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_TYPE`
        WHERE IS_ACTIVE = TRUE
        ORDER BY LABEL
        """
    )

    return [
        {
            "code": r["CODE"],
            "label": r["LABEL"],
        }
        for r in rows
    ]


# ============================================================
# UPDATE NEWS / BRÈVE
# ============================================================
def update_news(id_news: str, data: NewsUpdate):

    fields = {}

    # -------------------------
    # STRUCTURE
    # -------------------------
    if data.news_kind is not None:
        fields["NEWS_KIND"] = data.news_kind

    if data.news_type is not None:
        fields["NEWS_TYPE"] = data.news_type

    if data.id_company is not None:
        fields["ID_COMPANY"] = data.id_company

    # -------------------------
    # CONTENU
    # -------------------------
    if data.title is not None:
        fields["TITLE"] = data.title

    if data.excerpt is not None:
        fields["EXCERPT"] = data.excerpt

    if data.body is not None:
        fields["BODY"] = data.body

    # -------------------------
    # VISUEL
    # -------------------------
    if data.media_rectangle_id is not None:
        fields["MEDIA_RECTANGLE_ID"] = data.media_rectangle_id
        fields["HAS_VISUAL"] = bool(data.media_rectangle_id)

    # -------------------------
    # META
    # -------------------------
    if data.source_url is not None:
        fields["SOURCE_URL"] = data.source_url

    if data.author is not None:
        fields["AUTHOR"] = data.author

    fields["UPDATED_AT"] = datetime.utcnow()

    # -------------------------
    # UPDATE SQL
    # -------------------------
    if fields:
        update_bq(
            table=TABLE_NEWS,
            fields=fields,
            where={"ID_NEWS": id_news},
        )

    # -------------------------
    # RELATIONS — uniquement si envoyées
    # -------------------------
    client = get_bigquery_client()

    if data.topics is not None:
        client.query(
            f"DELETE FROM `{TABLE_NEWS_TOPIC}` WHERE ID_NEWS = @id",
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

    if data.persons is not None:
        client.query(
            f"DELETE FROM `{TABLE_NEWS_PERSON}` WHERE ID_NEWS = @id",
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", id_news)
                ]
            ),
        ).result()

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
# ============================================================
# PUBLISH
# ============================================================
def publish_news(id_news: str, published_at: Optional[str] = None):

    rows = query_bq(
        f"""
        SELECT
            n.ID_COMPANY,
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

    # ============================================================
    # 🔥 VISUEL OBLIGATOIRE POUR NEWS
    # ============================================================

    media_id = row["MEDIA_RECTANGLE_ID"]

    if row["NEWS_KIND"] == "NEWS":

        if not media_id:
            company_rect = row["COMPANY_RECT"]

            if not company_rect:
                raise ValueError("Un visuel est requis pour publier une news")

            # ====================================================
            # COPIE PHYSIQUE DU LOGO SOCIÉTÉ VERS /news/
            # ====================================================

            bucket_name = "ratecard-media"  # adapte si besoin

            storage_client = storage.Client()
            bucket = storage_client.bucket(bucket_name)

            source_blob = bucket.blob(f"companies/{company_rect}")

            if not source_blob.exists():
                raise ValueError("Logo société introuvable dans GCS")

            new_filename = f"NEWS_{id_news}_rect.jpg"
            destination_blob = bucket.blob(f"news/{new_filename}")

            destination_blob.rewrite(source_blob)

            # Mise à jour BQ avec le nouveau visuel
            update_bq(
                table=TABLE_NEWS,
                fields={
                    "MEDIA_RECTANGLE_ID": new_filename,
                    "HAS_VISUAL": True,
                },
                where={"ID_NEWS": id_news},
            )

            media_id = new_filename

    # ============================================================
    # DATE & STATUS
    # ============================================================

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
# SEARCH SIGNAUX — FLUX UNIQUEMENT
# ============================================================

def search_breves_public(
    topics: Optional[List[str]] = None,
    news_types: Optional[List[str]] = None,
    companies: Optional[List[str]] = None,
    limit: int = 20,
    cursor: Optional[str] = None,
):
    """
    Retourne uniquement :
    - le flux principal (items)
    - les actualités partenaires (sponsorised)

    Aucun calcul de stats ici.
    """

    params = {"limit": limit}
    where_clauses = ["status = 'PUBLISHED'"]

    # =====================================================
    # FILTRES
    # =====================================================

    if topics:
        where_clauses.append(
            """
            EXISTS (
                SELECT 1
                FROM UNNEST(topics) t
                WHERE t.id_topic IN UNNEST(@topics)
            )
            """
        )
        params["topics"] = topics

    if news_types:
        where_clauses.append("news_type IN UNNEST(@news_types)")
        params["news_types"] = news_types

    if companies:
        where_clauses.append("id_company IN UNNEST(@companies)")
        params["companies"] = companies

    if cursor:
        where_clauses.append("published_at < @cursor")
        params["cursor"] = cursor

    where_sql = " AND ".join(where_clauses)

    # =====================================================
    # ITEMS
    # =====================================================

    sql_items = f"""
        SELECT
            id_news,
            title,
            excerpt,
            published_at,
            news_type,
            news_kind,
            id_company,
            company_name,
            is_partner,
            topics
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED`
        WHERE {where_sql}
        ORDER BY published_at DESC
        LIMIT @limit
    """

    rows = query_bq(sql_items, params)

    items = [
        {
            "id": r.get("id_news"),
            "title": r.get("title"),
            "excerpt": r.get("excerpt"),
            "published_at": r.get("published_at"),
            "news_type": r.get("news_type"),
            "news_kind": r.get("news_kind"),  # 🔑 IMPORTANT
            "company": {
                "id_company": r.get("id_company"),
                "name": r.get("company_name"),
                "is_partner": bool(r.get("is_partner")),
            },
            "topics": r.get("topics", []) or [],
        }
        for r in rows
    ]

    # =====================================================
    # SPONSORISED (PARTENAIRES UNIQUEMENT)
    # =====================================================

    sql_sponsorised = f"""
        SELECT
            id_news,
            title,
            excerpt,
            published_at,
            news_type,
            news_kind,
            id_company,
            company_name,
            is_partner,
            topics
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED`
        WHERE {where_sql}
          AND is_partner = TRUE
        ORDER BY published_at DESC
        LIMIT 3
    """

    sponsor_rows = query_bq(sql_sponsorised, params)

    sponsorised = [
        {
            "id": r.get("id_news"),
            "title": r.get("title"),
            "excerpt": r.get("excerpt"),
            "published_at": r.get("published_at"),
            "news_type": r.get("news_type"),
            "news_kind": r.get("news_kind"),  # 🔑 IMPORTANT
            "company": {
                "id_company": r.get("id_company"),
                "name": r.get("company_name"),
                "is_partner": True,
            },
            "topics": r.get("topics", []) or [],
        }
        for r in sponsor_rows
    ]

    return {
        "items": items,
        "sponsorised": sponsorised,
    }



# ============================================================
# SIGNAUX STATS — STATS UNIQUEMENT
# ============================================================

def get_breves_stats_public():

    global_rows = query_bq("""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_STATS_GLOBAL`
    """)

    if global_rows:
        g = global_rows[0]
        total_count = g.get("TOTAL", 0) or 0
        last_7 = g.get("LAST_7_DAYS", 0) or 0
        last_30 = g.get("LAST_30_DAYS", 0) or 0
    else:
        total_count = 0
        last_7 = 0
        last_30 = 0

    types_rows = query_bq("""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_STATS_TYPE`
        ORDER BY TOTAL DESC
    """)

    types_stats = [
        {
            "news_type": r.get("NEWS_TYPE"),
            "total": r.get("TOTAL", 0) or 0,
            "last_7_days": r.get("LAST_7_DAYS", 0) or 0,
            "last_30_days": r.get("LAST_30_DAYS", 0) or 0,
        }
        for r in types_rows
    ]

    topics_rows = query_bq("""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_STATS_TOPIC`
        ORDER BY TOTAL DESC
    """)

    topics_stats = [
        {
            "id_topic": r.get("ID_TOPIC"),
            "label": r.get("LABEL"),
            "total": r.get("TOTAL", 0) or 0,
            "last_7_days": r.get("LAST_7_DAYS", 0) or 0,
            "last_30_days": r.get("LAST_30_DAYS", 0) or 0,
        }
        for r in topics_rows
        if r.get("ID_TOPIC") and r.get("LABEL")
    ]

    company_rows = query_bq("""
        SELECT *
        FROM `{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_STATS_COMPANY`
        ORDER BY TOTAL DESC
    """)

    top_companies = [
        {
            "id_company": r.get("ID_COMPANY"),
            "name": r.get("NAME"),
            "is_partner": bool(r.get("IS_PARTNER")),
            "total": r.get("TOTAL", 0) or 0,
            "last_7_days": r.get("LAST_7_DAYS", 0) or 0,
            "last_30_days": r.get("LAST_30_DAYS", 0) or 0,
        }
        for r in company_rows
        if r.get("ID_COMPANY") and r.get("NAME")
    ]

    return {
        "total_count": total_count,
        "last_7_days": last_7,
        "last_30_days": last_30,
        "topics_stats": topics_stats,
        "types_stats": types_stats,
        "top_companies": top_companies,
    }



# ============================================================
# LIST ALL COMPANIES — PUBLIC (FOR FILTER PANEL)
# ============================================================

def list_companies_public():
    sql = f"""
        SELECT
            c.ID_COMPANY,
            c.NAME,
            c.IS_PARTNER,
            COUNT(n.ID_NEWS) AS TOTAL_COUNT
        FROM `{TABLE_NEWS}` n
        JOIN `{TABLE_COMPANY}` c
          ON n.ID_COMPANY = c.ID_COMPANY
        WHERE
            n.STATUS = 'PUBLISHED'
            AND n.PUBLISHED_AT IS NOT NULL
        GROUP BY c.ID_COMPANY, c.NAME, c.IS_PARTNER
        ORDER BY TOTAL_COUNT DESC
    """

    rows = query_bq(sql)

    return [
        {
            "id_company": r["ID_COMPANY"],
            "name": r["NAME"],
            "is_partner": bool(r["IS_PARTNER"]),
            "total_count": r["TOTAL_COUNT"],
        }
        for r in rows
    ]



# ============================================================
# LIST BRÈVES — PUBLIC (PAGINÉ / PAR ANNÉE)
# ============================================================
def list_breves_public(
    year: int,
    limit: int = 20,
    cursor: Optional[str] = None,
):
    """
    Retourne les contenus publiés (BRÈVES + NEWS)
    rendus sous forme de brèves pour une année donnée,
    paginés par date (cursor-based).
    """

    params = {
        "year": year,
        "limit": limit,
    }

    cursor_clause = ""
    if cursor:
        cursor_clause = "AND n.PUBLISHED_AT < @cursor"
        params["cursor"] = cursor

    sql = f"""
        SELECT
            n.ID_NEWS,
            n.TITLE,
            n.EXCERPT,
            n.PUBLISHED_AT,

            -- SOCIÉTÉ
            c.NAME AS COMPANY_NAME,

            -- CATÉGORIE ÉDITORIALE
            n.NEWS_TYPE,

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
            AND EXTRACT(YEAR FROM n.PUBLISHED_AT) = @year
            {cursor_clause}

        ORDER BY n.PUBLISHED_AT DESC
        LIMIT @limit
    """

    rows = query_bq(sql, params)

    return [
        {
            "id": r["ID_NEWS"],
            "title": r["TITLE"],
            "excerpt": r["EXCERPT"],
            "published_at": r["PUBLISHED_AT"],
            "company": r["COMPANY_NAME"],
            "news_type": r["NEWS_TYPE"],
            "topics": r.get("TOPICS") or [],
        }
        for r in rows
    ]

def list_news_admin(
    limit: int = 50,
    offset: int = 0,
    news_type: str | None = None,
    news_kind: str | None = None,
    company: str | None = None,
):
    where_clauses = []
    params = {
        "limit": limit,
        "offset": offset,
    }

    # ---------------------------
    # FILTRES
    # ---------------------------

    if news_type:
        where_clauses.append("n.NEWS_TYPE = @news_type")
        params["news_type"] = news_type

    if news_kind:
        where_clauses.append("n.NEWS_KIND = @news_kind")
        params["news_kind"] = news_kind

    if company:
        where_clauses.append("LOWER(c.NAME) LIKE LOWER(@company)")
        params["company"] = f"%{company}%"

    where_sql = ""
    if where_clauses:
        where_sql = "WHERE " + " AND ".join(where_clauses)

    # ---------------------------
    # QUERY
    # ---------------------------

    sql = f"""
        SELECT
            n.ID_NEWS,
            n.TITLE,
            n.STATUS,
            n.PUBLISHED_AT,
            n.CREATED_AT,
            n.NEWS_KIND,
            n.NEWS_TYPE,
            c.NAME AS COMPANY_NAME

        FROM `{TABLE_NEWS}` n
        JOIN `{TABLE_COMPANY}` c
          ON n.ID_COMPANY = c.ID_COMPANY

        {where_sql}

        ORDER BY
            
            -- 1️⃣ Date de publication (les plus récentes en haut)
            IFNULL(n.PUBLISHED_AT, TIMESTAMP("1970-01-01")) DESC,

            -- 2️⃣ Priorité aux statuts (publié > draft > autres)
            CASE n.STATUS
                WHEN 'PUBLISHED' THEN 1
                WHEN 'DRAFT' THEN 2
                ELSE 3
            END,

            -- 3️⃣ Sinon fallback sur date de création
            n.CREATED_AT DESC

        LIMIT @limit
        OFFSET @offset
    """

    return query_bq(sql, params)


def get_news_admin_stats():
    sql = f"""
        SELECT
            COUNT(*) AS TOTAL,

            COUNTIF(STATUS = 'PUBLISHED') AS TOTAL_PUBLISHED,
            COUNTIF(STATUS = 'DRAFT') AS TOTAL_DRAFT,

            COUNTIF(NEWS_KIND = 'NEWS') AS TOTAL_NEWS,
            COUNTIF(NEWS_KIND = 'BRIEF') AS TOTAL_BRIEVES,

            COUNTIF(
                STATUS = 'PUBLISHED'
                AND EXTRACT(YEAR FROM PUBLISHED_AT) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP())
            ) AS TOTAL_PUBLISHED_THIS_YEAR

        FROM `{TABLE_NEWS}`
    """

    rows = query_bq(sql)

    return rows[0] if rows else {}




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
