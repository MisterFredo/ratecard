# backend/core/company/service.py

import uuid
from datetime import datetime
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)
from api.company.models import CompanyCreate, CompanyUpdate


TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_COMPANY_METRICS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_METRICS"
TABLE_NUMBERS_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_COMPANY"
TABLE_COMPANY_UNIVERSE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE"


ALLOWED_FREQUENCIES = ["WEEKLY", "MONTHLY", "QUARTERLY"]


# ============================================================
# CREATE COMPANY
# ============================================================
def create_company(data: CompanyCreate) -> str:
    company_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    insight_frequency = data.insight_frequency or "QUARTERLY"

    if insight_frequency not in ALLOWED_FREQUENCIES:
        raise ValueError("Invalid insight_frequency")

    row = [{
        "ID_COMPANY": company_id,
        "NAME": data.name,
        "TYPE": data.type,
        "DESCRIPTION": data.description or None,
        "MEDIA_LOGO_RECTANGLE_ID": None,
        "LINKEDIN_URL": data.linkedin_url or None,
        "WEBSITE_URL": data.website_url or None,
        "IS_PARTNER": bool(data.is_partner),
        "INSIGHT_FREQUENCY": insight_frequency,
        "CREATED_AT": now,
        "UPDATED_AT": now,
        "IS_ACTIVE": True,
    }]

    client = get_bigquery_client()
    job = client.load_table_from_json(
        row,
        TABLE_COMPANY,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )
    job.result()

    # 🔥 ASSIGN UNIVERS
    if data.universes:
        assign_company_universes(company_id, data.universes)

    return company_id

def assign_company_universes(company_id: str, universes: list[str]):

    # delete existing
    delete_query = f"""
    DELETE FROM `{TABLE_COMPANY_UNIVERSE}`
    WHERE ID_COMPANY = @company_id
    """

    query_bq(delete_query, {"company_id": company_id})

    # insert new
    for u in universes:
        insert_query = f"""
        INSERT INTO `{TABLE_COMPANY_UNIVERSE}` (
            ID_COMPANY,
            ID_UNIVERSE,
            CREATED_AT
        )
        VALUES (
            @company_id,
            @universe,
            CURRENT_TIMESTAMP()
        )
        """

        query_bq(insert_query, {
            "company_id": company_id,
            "universe": u,
        })

def get_company_universes(company_id: str):

    query = f"""
    SELECT ID_UNIVERSE
    FROM `{TABLE_COMPANY_UNIVERSE}`
    WHERE ID_COMPANY = @company_id
    """

    rows = query_bq(query, {"company_id": company_id})

    return [r["ID_UNIVERSE"] for r in rows]

# ============================================================
# LIST COMPANIES — BQ BRUT
# ============================================================
def list_companies():
    sql = f"""
        SELECT
            c.ID_COMPANY,
            c.NAME,
            c.TYPE,
            CAST(c.IS_PARTNER AS BOOL) AS IS_PARTNER,
            c.MEDIA_LOGO_RECTANGLE_ID,
            c.INSIGHT_FREQUENCY,

            COALESCE(m.total, 0) AS NB_ANALYSES,
            COALESCE(m.last_30_days, 0) AS DELTA_30D,

            CASE
                WHEN c.DESCRIPTION IS NOT NULL
                     AND TRIM(c.DESCRIPTION) != ""
                THEN TRUE ELSE FALSE
            END AS HAS_DESCRIPTION,

            CASE
                WHEN c.WIKI_CONTENT IS NOT NULL
                     AND TRIM(c.WIKI_CONTENT) != ""
                THEN TRUE ELSE FALSE
            END AS HAS_WIKI,

            -- ✅ HAS NUMBERS
            nc.ID_COMPANY IS NOT NULL AS HAS_NUMBERS,

            -- 🔥 RADAR
            r.ID_INSIGHT,
            r.KEY_POINTS,

            -- 🔥 UNIVERS (ARRAY)
            ARRAY_AGG(DISTINCT cu.ID_UNIVERSE IGNORE NULLS) AS UNIVERSS

        FROM `{TABLE_COMPANY}` c

        LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_STATS_COMPANY` m
          ON m.id_company = c.ID_COMPANY

        LEFT JOIN (
            SELECT DISTINCT ID_COMPANY
            FROM `{TABLE_NUMBERS_COMPANY}`
        ) nc
          ON nc.ID_COMPANY = c.ID_COMPANY

        LEFT JOIN (
            SELECT *
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_RADAR`
            WHERE STATUS = "GENERATED"

            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY ENTITY_ID
                ORDER BY YEAR DESC, PERIOD DESC
            ) = 1
        ) r
          ON r.ENTITY_ID = c.ID_COMPANY
          AND r.ENTITY_TYPE = "company"

        -- 🔥 JOIN UNIVERS
        LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_UNIVERSE` cu
          ON cu.ID_COMPANY = c.ID_COMPANY

        WHERE c.IS_ACTIVE = TRUE

        GROUP BY
            c.ID_COMPANY,
            c.NAME,
            c.TYPE,
            c.IS_PARTNER,
            c.MEDIA_LOGO_RECTANGLE_ID,
            c.INSIGHT_FREQUENCY,
            m.total,
            m.last_30_days,
            HAS_DESCRIPTION,
            HAS_WIKI,
            HAS_NUMBERS,
            r.ID_INSIGHT,
            r.KEY_POINTS

        ORDER BY UPPER(c.NAME) ASC
    """

    rows = query_bq(sql)

    return [
        {
            "id_company": r["ID_COMPANY"],
            "name": r["NAME"],
            "type": r.get("TYPE"),
            "is_partner": r["IS_PARTNER"],
            "media_logo_rectangle_id": r["MEDIA_LOGO_RECTANGLE_ID"],
            "insight_frequency": r.get("INSIGHT_FREQUENCY"),
            "nb_analyses": r["NB_ANALYSES"],
            "delta_30d": r["DELTA_30D"],
            "has_description": r["HAS_DESCRIPTION"],
            "has_wiki": r["HAS_WIKI"],

            "has_numbers": r.get("HAS_NUMBERS", False),

            "last_radar": {
                "id_insight": r["ID_INSIGHT"],
                "key_points": r["KEY_POINTS"],
            } if r.get("ID_INSIGHT") else None,

            # 🔥 NEW
            "universes": r.get("UNIVERSS") or [],
        }
        for r in rows
    ]

def list_company_types():

    client = get_bigquery_client()

    query = f"""
        SELECT
            ID_TYPE,
            LABEL
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_TYPE`
        ORDER BY LABEL
    """

    rows = client.query(query).result()

    return [
        {
            "id_type": row["ID_TYPE"],
            "label": row["LABEL"],
        }
        for row in rows
    ]


def list_companies_for_user(user_id: Optional[str]) -> List[Dict]:

    universe_filter = ""

    if user_id:
        universe_filter = f"""
        AND (
            NOT EXISTS (
                SELECT 1 FROM `{TABLE_USER_UNIVERSE}`
                WHERE ID_USER = @user_id
            )
            OR cu.universes IS NULL
            OR EXISTS (
                SELECT 1
                FROM UNNEST(cu.universes) u
                JOIN `{TABLE_USER_UNIVERSE}` uu
                  ON uu.ID_UNIVERSE = u
                WHERE uu.ID_USER = @user_id
            )
        )
        """

    sql = f"""
    WITH company_universes AS (
        SELECT
            c.ID_COMPANY,
            ARRAY_AGG(DISTINCT cu.ID_UNIVERSE IGNORE NULLS) AS universes
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY` c
        LEFT JOIN `{TABLE_COMPANY_UNIVERSE}` cu
            ON cu.ID_COMPANY = c.ID_COMPANY
        GROUP BY c.ID_COMPANY
    )

    SELECT
        c.ID_COMPANY as id_company,
        c.NAME as name,
        c.MEDIA_LOGO_RECTANGLE_ID as media_logo_rectangle_id,
        c.IS_PARTNER as is_partner,

        COALESCE(stats.total, 0) as nb_analyses,
        COALESCE(stats.last_30_days, 0) as delta_30d,

        cu.universes

    FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY` c

    LEFT JOIN company_universes cu
        ON cu.ID_COMPANY = c.ID_COMPANY

    LEFT JOIN `{VIEW_STATS_COMPANY}` stats
        ON stats.id_company = c.ID_COMPANY

    WHERE TRUE
    {universe_filter}

    ORDER BY c.NAME
    """

    params = {}
    if user_id:
        params["user_id"] = user_id

    return query_bq(sql, params)

# ============================================================
# GET ONE COMPANY — BQ BRUT
# ============================================================
def get_company(company_id: str):

    sql = f"""
        SELECT
            c.*,
            nc.ID_COMPANY IS NOT NULL AS HAS_NUMBERS
        FROM `{TABLE_COMPANY}` c
        LEFT JOIN (
            SELECT DISTINCT ID_COMPANY
            FROM `{TABLE_NUMBERS_COMPANY}`
        ) nc
        ON nc.ID_COMPANY = c.ID_COMPANY
        WHERE c.ID_COMPANY = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": company_id})

    if not rows:
        return None

    r = rows[0]

    return {
        "id_company": r["ID_COMPANY"],
        "name": r["NAME"],
        "type": r.get("TYPE"),
        "description": r.get("DESCRIPTION"),

        # Wiki
        "wiki_content": r.get("WIKI_CONTENT"),
        "wiki_source_id": r.get("WIKI_SOURCE_ID"),
        "wiki_updated_at": r.get("WIKI_UPDATED_AT"),
        "wiki_vectorised": r.get("WIKI_VECTORISED", False),

        # Media
        "media_logo_rectangle_id": r.get("MEDIA_LOGO_RECTANGLE_ID"),

        # Liens
        "linkedin_url": r.get("LINKEDIN_URL"),
        "website_url": r.get("WEBSITE_URL"),

        # Statut
        "is_partner": r.get("IS_PARTNER", False),
        "is_active": r.get("IS_ACTIVE", True),

        # 🔥 NEW
        "insight_frequency": r.get("INSIGHT_FREQUENCY"),

        # ✅ NEW
        "has_numbers": r.get("HAS_NUMBERS", False),
        "universes": get_company_universes(company_id),

        # Dates
        "created_at": r.get("CREATED_AT"),
        "updated_at": r.get("UPDATED_AT"),
    }


# ============================================================
# UPDATE COMPANY
# ============================================================
def update_company(id_company: str, data: CompanyUpdate) -> bool:
    values = data.dict(exclude_unset=True)

    # 🔥 univers à part
    universes = values.pop("universes", None)

    if not values and universes is None:
        return False

    mapping = {
        "name": "NAME",
        "type": "TYPE",
        "description": "DESCRIPTION",
        "linkedin_url": "LINKEDIN_URL",
        "website_url": "WEBSITE_URL",
        "is_partner": "IS_PARTNER",
        "wiki_content": "WIKI_CONTENT",
        "insight_frequency": "INSIGHT_FREQUENCY",
    }

    bq_values = {
        mapping[k]: v
        for k, v in values.items()
        if k in mapping
    }

    if "INSIGHT_FREQUENCY" in bq_values:
        if bq_values["INSIGHT_FREQUENCY"] not in ALLOWED_FREQUENCIES:
            raise ValueError("Invalid insight_frequency")

    if "WIKI_CONTENT" in bq_values:
        bq_values["WIKI_UPDATED_AT"] = datetime.utcnow().isoformat()
        bq_values["WIKI_VECTORISED"] = False

    if bq_values:
        bq_values["UPDATED_AT"] = datetime.utcnow().isoformat()

        update_bq(
            table=TABLE_COMPANY,
            fields=bq_values,
            where={"ID_COMPANY": id_company},
        )

    # 🔥 UPDATE UNIVERS
    if universes is not None:
        assign_company_universes(id_company, universes)

    return True


# ============================================================
# DELETE COMPANY (SOFT DELETE)
# ============================================================
def delete_company(id_company: str) -> bool:

    return update_bq(
        table=TABLE_COMPANY,
        fields={
            "IS_ACTIVE": False,
            "UPDATED_AT": datetime.utcnow().isoformat(),
        },
        where={"ID_COMPANY": id_company},
    )
