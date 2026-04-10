import uuid
import bcrypt

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


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
# GET USER
# =========================================================

def get_user_by_email(email: str):
    query = f"""
    SELECT *
    FROM `{TABLE_USER}`
    WHERE EMAIL = @email
    AND IS_ACTIVE = TRUE
    LIMIT 1
    """

    rows = query_bq(query, {"email": email})
    return rows[0] if rows else None


def get_user_by_id(user_id: str):
    query = f"""
    SELECT *
    FROM `{TABLE_USER}`
    WHERE ID_USER = @user_id
    AND IS_ACTIVE = TRUE
    LIMIT 1
    """

    rows = query_bq(query, {"user_id": user_id})
    return rows[0] if rows else None


# =========================================================
# UNIVERS
# =========================================================

def get_user_universes(user_id: str):
    query = f"""
    SELECT ID_UNIVERSE
    FROM `{TABLE_USER_UNIVERSE}`
    WHERE ID_USER = @user_id
    """

    rows = query_bq(query, {"user_id": user_id})
    return [row["ID_UNIVERSE"] for row in rows]


def get_sources_from_universes(universes: list[str]):
    if not universes:
        return []

    query = f"""
    SELECT DISTINCT ID_SOURCE
    FROM `{TABLE_SOURCE_UNIVERSE}`
    WHERE ID_UNIVERSE IN UNNEST(@universes)
    """

    rows = query_bq(query, {"universes": universes})
    return [row["ID_SOURCE"] for row in rows]


# =========================================================
# USER CONTEXT (future feed)
# =========================================================

def get_user_context(user_id: str):
    user = get_user_by_id(user_id)

    if not user:
        return None

    universes = get_user_universes(user_id)
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
    existing = query_bq(
        f"""
        SELECT ID_USER
        FROM `{TABLE_USER}`
        WHERE EMAIL = @email
        LIMIT 1
        """,
        {"email": payload.email},
    )

    if existing:
        raise ValueError("User already exists")

    if not payload.password:
        raise ValueError("Password is required")

    password_hash = hash_password(payload.password)
    user_id = str(uuid.uuid4())

    # =====================================================
    # INSERT USER
    # =====================================================

    query_bq(
        f"""
        INSERT INTO `{TABLE_USER}` (
            ID_USER,
            EMAIL,
            NAME,
            COMPANY,
            LANGUAGE,
            PASSWORD_HASH,
            ROLE,
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
            @role,
            TRUE,
            CURRENT_TIMESTAMP(),
            CURRENT_TIMESTAMP()
        )
        """,
        {
            "id_user": user_id,
            "email": payload.email,
            "name": payload.name,
            "company": payload.company,
            "language": payload.language or "fr",
            "password_hash": password_hash,
            "role": payload.role or "user",
        },
    )

    # 🔥 univers
    assign_universes(user_id, payload.universes)

    return user_id


# =========================================================
# UPDATE USER
# =========================================================

def update_user(payload):
    user = get_user_by_id(payload.user_id)

    if not user:
        raise ValueError("User not found")

    # =====================================================
    # UPDATE CORE FIELDS
    # =====================================================

    query_bq(
        f"""
        UPDATE `{TABLE_USER}`
        SET
            NAME = @name,
            COMPANY = @company,
            LANGUAGE = @language,
            ROLE = COALESCE(@role, ROLE),
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ID_USER = @user_id
        """,
        {
            "user_id": payload.user_id,
            "name": payload.name,
            "company": payload.company,
            "language": payload.language or "fr",
            "role": payload.role,
        },
    )

    # =====================================================
    # UPDATE UNIVERS (REPLACE ALL)
    # =====================================================

    assign_universes(payload.user_id, payload.universes)


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
        ROLE,
        IS_ACTIVE,
        CREATED_AT
    FROM `{TABLE_USER}`
    ORDER BY CREATED_AT DESC
    """

    return query_bq(query)


# =========================================================
# ASSIGN UNIVERS (REPLACE ALL)
# =========================================================

def assign_universes(user_id: str, universes: list[str]):
    # 🔥 DELETE
    query_bq(
        f"""
        DELETE FROM `{TABLE_USER_UNIVERSE}`
        WHERE ID_USER = @user_id
        """,
        {"user_id": user_id},
    )

    # 🔥 INSERT (simple loop ok pour volume faible)
    for u in universes:
        query_bq(
            f"""
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
            """,
            {
                "user_id": user_id,
                "universe": u,
            },
        )
