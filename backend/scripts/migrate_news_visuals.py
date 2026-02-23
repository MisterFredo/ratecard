import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from google.cloud import storage
from utils.bigquery_utils import query_bq, update_bq
from config import BQ_PROJECT, BQ_DATASET

TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"

bucket_name = "ratecard-media"

storage_client = storage.Client()
bucket = storage_client.bucket(bucket_name)

rows = query_bq(f"""
    SELECT ID_NEWS, MEDIA_RECTANGLE_ID
    FROM `{TABLE_NEWS}`
    WHERE STATUS = 'PUBLISHED'
""")

for row in rows:
    news_id = row["ID_NEWS"]
    media_id = row["MEDIA_RECTANGLE_ID"]

    if not media_id:
        continue

    if media_id.startswith("COMPANY_"):

        print("Migrating:", news_id)

        source_blob = bucket.blob(f"companies/{media_id}")

        if not source_blob.exists():
            print("Missing source:", media_id)
            continue

        new_filename = f"NEWS_{news_id}_rect.jpg"
        destination_blob = bucket.blob(f"news/{new_filename}")

        destination_blob.rewrite(source_blob)

        update_bq(
            table=TABLE_NEWS,
            fields={
                "MEDIA_RECTANGLE_ID": new_filename,
                "HAS_VISUAL": True,
            },
            where={"ID_NEWS": news_id},
        )

print("Migration finished.")
