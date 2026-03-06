import uuid
from datetime import datetime
from typing import Optional

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

    source_id = data.source_id or str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "SOURCE_ID": source_id,
        "NAME": data.name,
        "TYPE_SOURCE": data.type_source,
        "DESCRIPTION": data.description,
        "DOMAIN": data.domain,
        "AUTHOR": data.author,
        "AUTHOR_PROFILE": data.author_profile,
        "CREATED_AT": now,
    }]

    client = get_bigquery_client()

    job = client.load_table_from_json(
        row,
        TABLE_SOURCE,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )

    job.result()

    return source_id

# ============================================================
# LIST SOURCES
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

    return query_bq(sql)


# ============================================================
# GET ONE SOURCE
# ============================================================
def get_source(source_id: str):

    sql = f"""
        SELECT *
        FROM `{TABLE_SOURCE}`
        WHERE SOURCE_ID = @id
        LIMIT 1
    """

    rows = query_bq(sql, {"id": source_id})

    if not rows:
        return None

    return rows[0]


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
