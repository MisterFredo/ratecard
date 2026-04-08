import uuid
import bcrypt
from datetime import datetime

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)

# =========================================================
# TABLES
# =========================================================

TABLE_USER = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER"
TABLE_USER_UNIVERSE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE"
TABLE_SOURCE_UNIVERSE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOURCE_UNIVERSE"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


# =========================================================
# GET USER BY EMAIL
# =========================================================

def get_user_by_email(email: str):
    query = f"""
    SELECT *
    FROM `{TABLE_USER}`
    WHERE EMAIL = @email
    AND IS_ACTIVE = TRUE
    LIMIT 1
    """

    params = [
        bigquery.ScalarQueryParameter("email", "STRING", email),
    ]

    rows = query_bq(query, params)

    return rows[0] if rows else None


# =========================================================
# GET USER UNIVERS
# =========================================================

def get_user_universes(user_id: str):
    query = f"""
    SELECT ID_UNIVERSE
    FROM `{TABLE_USER_UNIVERSE}`
    WHERE ID_USER = @user_id
    """

    params = [
        bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
    ]

    rows = query_bq(query, params)

    return [row["ID_UNIVERSE"] for row in rows]


# =========================================================
# GET SOURCES FROM UNIVERS
# =========================================================

def get_sources_from_universes(universes: list[str]):
    if not universes:
        return []

    query = f"""
    SELECT DISTINCT ID_SOURCE
    FROM `{TABLE_SOURCE_UNIVERSE}`
    WHERE ID_UNIVERSE IN UNNEST(@universes)
    """

    params = [
        bigquery.ArrayQueryParameter("universes", "STRING", universes),
    ]

    rows = query_bq(query, params)

    return [row["ID_SOURCE"] for row in rows]


# =========================================================
# GET USER CONTEXT
# =========================================================

def get_user_context(email: str):
    user = get_user_by_email(email)

    if not user:
        return None

    universes = get_user_universes(user["ID_USER"])
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
    # 🔎 check existing
    check_query = f"""
    SELECT ID_USER
    FROM `{TABLE_USER}`
    WHERE EMAIL = @email
    LIMIT 1
    """

    params = [
        bigquery.ScalarQueryParameter("email", "STRING", payload.email),
    ]

    existing = query_bq(check_query, params)

    if existing:
        raise ValueError("User already exists")

    user_id = str(uuid.uuid4())

    insert_query = f"""
    INSERT INTO `{TABLE_USER}` (
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

    params = [
        bigquery.ScalarQueryParameter("id_user", "STRING", user_id),
        bigquery.ScalarQueryParameter("email", "STRING", payload.email),
        bigquery.ScalarQueryParameter("name", "STRING", payload.name),
        bigquery.ScalarQueryParameter("company", "STRING", payload.company),
        bigquery.ScalarQueryParameter("language", "STRING", payload.language or "fr"),
    ]

    update_bq(insert_query, params)

    return user_id


# =========================================================
# ASSIGN UNIVERS (REPLACE ALL)
# =========================================================

def assign_universes(user_id: str, universes: list[str]):
    # 🔥 delete existing
    delete_query = f"""
    DELETE FROM `{TABLE_USER_UNIVERSE}`
    WHERE ID_USER = @user_id
    """

    params = [
        bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
    ]

    update_bq(delete_query, params)

    # ➕ insert new
    for u in universes:
        insert_query = f"""
        INSERT INTO `{TABLE_USER_UNIVERSE}` (
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

        params = [
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
            bigquery.ScalarQueryParameter("universe", "STRING", u),
        ]

        update_bq(insert_query, params)
