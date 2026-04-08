from utils.bigquery_utils import get_bigquery_client
from google.cloud import bigquery

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

    return list(rows)[0] if rows.total_rows > 0 else None

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

def get_user_context(email: str):
    user = get_user_by_email(email)

    if not user:
        return None

    universes = get_user_universes(user.ID_USER)

    return {
        "user": user,
        "universes": universes,
    }

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
