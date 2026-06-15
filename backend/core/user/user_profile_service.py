from typing import Optional, Dict, List

from config import (
    BQ_PROJECT,
    BQ_DATASET,
)

from utils.bigquery_utils import (
    query_bq,
)

TABLE_USER_PROFILE = (
    f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_USER_PROFILE"
)

# =========================================================
# GET USER PROFILE
# =========================================================

def get_user_profile(
    user_id: str
) -> Optional[Dict]:

    rows = query_bq(
        f"""
        SELECT
            GEOGRAPHY_1,
            GEOGRAPHY_2,
            GEOGRAPHY_3,
            PROFILE_TEXT
        FROM `{TABLE_USER_PROFILE}`
        WHERE ID_USER = @user_id
        LIMIT 1
        """,
        {
            "user_id": user_id
        }
    )

    if not rows:
        return None

    row = rows[0]

    return {
        "geography_1": row.get("GEOGRAPHY_1"),
        "geography_2": row.get("GEOGRAPHY_2"),
        "geography_3": row.get("GEOGRAPHY_3"),
        "profile_text": row.get("PROFILE_TEXT"),
    }

# =========================================================
# UPSERT USER PROFILE
# =========================================================

def update_user_profile(
    user_id: str,
    geography_1: Optional[str] = None,
    geography_2: Optional[str] = None,
    geography_3: Optional[str] = None,
    profile_text: Optional[str] = None,
):

    query_bq(
        f"""
        MERGE `{TABLE_USER_PROFILE}` T
        USING (
            SELECT
                @user_id AS ID_USER,
                @geography_1 AS GEOGRAPHY_1,
                @geography_2 AS GEOGRAPHY_2,
                @geography_3 AS GEOGRAPHY_3,
                @profile_text AS PROFILE_TEXT
        ) S

        ON T.ID_USER = S.ID_USER

        WHEN MATCHED THEN
          UPDATE SET
            GEOGRAPHY_1 = S.GEOGRAPHY_1,
            GEOGRAPHY_2 = S.GEOGRAPHY_2,
            GEOGRAPHY_3 = S.GEOGRAPHY_3,
            PROFILE_TEXT = S.PROFILE_TEXT,
            UPDATED_AT = CURRENT_TIMESTAMP()

        WHEN NOT MATCHED THEN
          INSERT (
            ID_USER,
            GEOGRAPHY_1,
            GEOGRAPHY_2,
            GEOGRAPHY_3,
            PROFILE_TEXT,
            CREATED_AT,
            UPDATED_AT
          )
          VALUES (
            S.ID_USER,
            S.GEOGRAPHY_1,
            S.GEOGRAPHY_2,
            S.GEOGRAPHY_3,
            S.PROFILE_TEXT,
            CURRENT_TIMESTAMP(),
            CURRENT_TIMESTAMP()
          )
        """,
        {
            "user_id": user_id,
            "geography_1": geography_1,
            "geography_2": geography_2,
            "geography_3": geography_3,
            "profile_text": profile_text,
        }
    )
