from uuid import uuid4
from datetime import datetime
from utils.bigquery_utils import insert_bq
from config import BQ_PROJECT, BQ_DATASET

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_MEDIA"


def insert_visual(format: str, entity_type: str, entity_id: str, filepath: str, title: str):
    media_id = str(uuid4())
    now = datetime.utcnow().isoformat()

    row = [{
        "ID_MEDIA": media_id,
        "FILEPATH": filepath,
        "FORMAT": format,
        "TITLE": title,
        "ENTITY_TYPE": entity_type,
        "ENTITY_ID": entity_id,
        "CREATED_AT": now,
    }]

    insert_bq(TABLE, row)
    return media_id
