import uuid
from datetime import datetime

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import (
    query_bq,
    update_bq,
    get_bigquery_client,
)

from api.source.models import SourceCreate, SourceUpdate


TABLE_SOURCE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOURCE"


# ============================================================
# CREATE SOURCE
# ============================================================
def create_source(data: SourceCreate) -> str:

    source_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "SOURCE_ID": source_id,  # ← obligatoire
        "NAME": data.name,
        "TYPE_SOURCE": data.type_source,
        "DESCRIPTION": data.description,
        "DOMAIN": data.domain,
        "AUTHOR": data.author,
        "AUTHOR_PROFILE": data.author_profile,
        "CREATED_AT": now,
    }]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        TABLE_SOURCE,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    return source_id

# ============================================================
# LIST SOURCES (snake_case contractuel)
# ============================================================
def list_sources():

    sql = f"""
        SELECT
            SOURCE_ID,
            NAME,
            TYPE_SOURCE,
            DESCRIPTION,
            DOMAIN,
            AUTHOR,
            AUTHOR_PROFILE,
            CREATED_AT
        FROM `{TABLE_SOURCE}`
        ORDER BY NAME ASC
    """

    rows = query_bq(sql)

    return [
        {
            "source_id": r["SOURCE_ID"],
            "name": r["NAME"],
            "type_source": r["TYPE_SOURCE"],
            "description": r["DESCRIPTION"],
            "domain": r["DOMAIN"],
            "author": r["AUTHOR"],
            "author_profile": r["AUTHOR_PROFILE"],
            "created_at": r["CREATED_AT"],
        }
        for r in rows
    ]


# ============================================================
# GET ONE SOURCE (snake_case contractuel)
# ============================================================
def get_source(source_id: str):

    sql = f"""
        SELECT
            SOURCE_ID,
            NAME,
            TYPE_SOURCE,
            DESCRIPTION,
            DOMAIN,
            AUTHOR,
            AUTHOR_PROFILE,
            CREATED_AT
        FROM `{TABLE_SOURCE}`
        WHERE SOURCE_ID = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": source_id})

    if not rows:
        return None

    r = rows[0]

    return {
        "source_id": r["SOURCE_ID"],
        "name": r["NAME"],
        "type_source": r["TYPE_SOURCE"],
        "description": r["DESCRIPTION"],
        "domain": r["DOMAIN"],
        "author": r["AUTHOR"],
        "author_profile": r["AUTHOR_PROFILE"],
        "created_at": r["CREATED_AT"],
    }


# ============================================================
# UPDATE SOURCE
# ============================================================
def update_source(source_id: str, data: SourceUpdate) -> bool:

    values = data.dict(exclude_unset=True)

    if not values:
        return False

    mapping = {
        "name": "NAME",
        "type_source": "TYPE_SOURCE",
        "description": "DESCRIPTION",
        "domain": "DOMAIN",
        "author": "AUTHOR",
        "author_profile": "AUTHOR_PROFILE",
    }

    bq_values = {
        mapping[k]: v
        for k, v in values.items()
        if k in mapping
    }

    return update_bq(
        table=TABLE_SOURCE,
        fields=bq_values,
        where={"SOURCE_ID": source_id},
    )


# ============================================================
# DELETE SOURCE
# ============================================================
def delete_source(source_id: str) -> bool:

    existing = query_bq(
        f"""
        SELECT SOURCE_ID
        FROM `{TABLE_SOURCE}`
        WHERE SOURCE_ID = @id
        """,
        {"id": source_id},
    )

    if not existing:
        return False

    query_bq(
        f"""
        DELETE FROM `{TABLE_SOURCE}`
        WHERE SOURCE_ID = @id
        """,
        {"id": source_id},
    )

    return True
