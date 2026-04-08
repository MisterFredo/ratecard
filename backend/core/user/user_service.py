from utils.bigquery_utils import get_bigquery_client
from google.cloud import bigquery
import uuid


# =========================================================
# GET USER BY EMAIL
# =========================================================

def get_user_by_email(email: str):
    query = """
    SELECT *
    FROM `RATECARD_USER`
    WHERE EMAIL = @email
    AND IS_ACTIVE = TRUE
    LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("email", "STRING", email),
        ]
    )

    rows = get_bigquery_client().query(query, job_config=job_config).result()
    rows_list = list(rows)

    return rows_list[0] if rows_list else None


# =========================================================
# GET USER UNIVERS
# =========================================================

def get_user_universes(user_id: str):
    query = """
    SELECT ID_UNIVERSE
    FROM `RATECARD_USER_UNIVERSE`
    WHERE ID_USER = @user_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )

    rows = get_bigquery_client().query(query, job_config=job_config).result()

    return [row.ID_UNIVERSE for row in rows]


# =========================================================
# GET SOURCES FROM UNIVERS
# =========================================================

def get_sources_from_universes(universes: list[str]):
    if not universes:
        return []

    query = """
    SELECT DISTINCT ID_SOURCE
    FROM `RATECARD_SOURCE_UNIVERSE`
    WHERE ID_UNIVERSE IN UNNEST(@universes)
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ArrayQueryParameter("universes", "STRING", universes),
        ]
    )

    rows = get_bigquery_client().query(query, job_config=job_config).result()

    return [row.ID_SOURCE for row in rows]


# =========================================================
# GET USER CONTEXT
# =========================================================

def get_user_context(email: str):
    user = get_user_by_email(email)

    if not user:
        return None

    universes = get_user_universes(user.ID_USER)
    sources = get_sources_from_universes(universes)

    return {
        "user": user,
        "universes": universes,
        "sources": sources,
    }


# =========================================================
# CREATE USER
# =========================================================

def create_user(payload):
    client = get_bigquery_client()

    # 🔎 Check if user exists
    check_query = """
    SELECT ID_USER
    FROM `RATECARD_USER`
    WHERE EMAIL = @email
    LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("email", "STRING", payload.email),
        ]
    )

    rows = list(client.query(check_query, job_config=job_config).result())

    if rows:
        raise ValueError("User already exists")

    user_id = str(uuid.uuid4())

    insert_query = """
    INSERT INTO `RATECARD_USER` (
        ID_USER,
        EMAIL,
        NAME,
        COMPANY,
        LANGUAGE,
        IS_ACTIVE,
        CREATED_AT
    )
    VALUES (
        @id_user,
        @email,
        @name,
        @company,
        @language,
        TRUE,
        CURRENT_TIMESTAMP()
    )
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("id_user", "STRING", user_id),
            bigquery.ScalarQueryParameter("email", "STRING", payload.email),
            bigquery.ScalarQueryParameter("name", "STRING", payload.name),
            bigquery.ScalarQueryParameter("company", "STRING", payload.company),
            bigquery.ScalarQueryParameter("language", "STRING", payload.language or "fr"),
        ]
    )

    client.query(insert_query, job_config=job_config).result()

    return user_id


# =========================================================
# ASSIGN UNIVERS (REPLACE ALL)
# =========================================================

def assign_universes(user_id: str, universes: list[str]):
    client = get_bigquery_client()

    # 🔥 delete existing
    delete_query = """
    DELETE FROM `RATECARD_USER_UNIVERSE`
    WHERE ID_USER = @user_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )

    client.query(delete_query, job_config=job_config).result()

    # ➕ insert new
    for u in universes:
        insert_query = """
        INSERT INTO `RATECARD_USER_UNIVERSE` (
            ID_USER,
            ID_UNIVERSE,
            CREATED_AT
        )
        VALUES (
            @user_id,
            @universe,
            CURRENT_TIMESTAMP()
        )
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
                bigquery.ScalarQueryParameter("universe", "STRING", u),
            ]
        )

        client.query(insert_query, job_config=job_config).result()
