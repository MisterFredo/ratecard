import uuid
import bcrypt

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
)

# =========================================================
# TABLES
# =========================================================

TABLE_USER = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER"
TABLE_USER_UNIVERSE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_UNIVERSE"
TABLE_SOURCE_UNIVERSE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOURCE_UNIVERSE"


# =========================================================
# PASSWORD
# =========================================================

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

    params = {
        "email": email,
    }

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

    params = {
        "user_id": user_id,
    }

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

    params = {
        "universes": universes,
    }

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

    params = {
        "email": payload.email,
    }

    existing = query_bq(check_query, params)

    if existing:
        raise ValueError("User already exists")

    # 🔐 password
    if not payload.password:
        raise ValueError("Password is required")

    password_hash = hash_password(payload.password)

    user_id = str(uuid.uuid4())

    # =====================================================
    # INSERT USER
    # =====================================================

    insert_query = f"""
    INSERT INTO `{TABLE_USER}` (
        ID_USER,
        EMAIL,
        NAME,
        COMPANY,
        LANGUAGE,
        PASSWORD_HASH,
        IS_ACTIVE,
        CREATED_AT,
        UPDATED_AT
    )
    VALUES (
        @id_user,
        @email,
        @name,
        @company,
        @language,
        @password_hash,
        TRUE,
        CURRENT_TIMESTAMP(),
        CURRENT_TIMESTAMP()
    )
    """

    params = {
        "id_user": user_id,
        "email": payload.email,
        "name": payload.name,
        "company": payload.company,
        "language": payload.language or "fr",
        "password_hash": password_hash,
    }

    query_bq(insert_query, params)

    # =====================================================
    # 🔥 ASSIGN UNIVERS DIRECT
    # =====================================================

    if payload.universes:
        assign_universes(user_id, payload.universes)

    return user_id

# =========================================================
# LIST USERS
# =========================================================

def list_users():
    query = f"""
    SELECT
        ID_USER,
        EMAIL,
        NAME,
        COMPANY,
        LANGUAGE,
        IS_ACTIVE,
        CREATED_AT
    FROM `{TABLE_USER}`
    ORDER BY CREATED_AT DESC
    """

    rows = query_bq(query)

    return rows


# =========================================================
# ASSIGN UNIVERS (REPLACE ALL)
# =========================================================

def assign_universes(user_id: str, universes: list[str]):
    # 🔥 delete existing
    delete_query = f"""
    DELETE FROM `{TABLE_USER_UNIVERSE}`
    WHERE ID_USER = @user_id
    """

    params = {
        "user_id": user_id,
    }

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

        params = {
            "user_id": user_id,
            "universe": u,
        }

        query_bq(insert_query, params)
