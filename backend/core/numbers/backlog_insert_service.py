import uuid
from datetime import datetime, timezone

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import get_bigquery_client
from google.cloud import bigquery


def insert_backlog_result(result: dict):

    TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS_BACKLOG"

    output = result.get("output") or {}
    input_data = result.get("input") or {}

    row = {
        "ID_BACKLOG": str(uuid.uuid4()),
        "ID_CONTENT": input_data.get("id_content"),

        "RAW_LINE": input_data.get("chiffre"),

        "LABEL": output.get("label"),
        "VALUE": float(output.get("value")) if output.get("value") else None,
        "UNIT": output.get("unit"),
        "CONTEXT": output.get("context"),

        "ACTOR": output.get("actor"),
        "MARKET": output.get("market"),
        "PERIOD": output.get("period"),
        "CONFIDENCE": output.get("confidence"),

        "DECISION": output.get("decision"),

        "CREATED_AT": datetime.now(timezone.utc).isoformat(),
    }

    client = get_bigquery_client()

    client.load_table_from_json(
        [row],
        TABLE,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()
