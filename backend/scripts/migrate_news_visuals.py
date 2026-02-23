import sys
import os
import json

# ------------------------------------------------------------
# Permet d'importer utils / config
# ------------------------------------------------------------
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)

# ------------------------------------------------------------
# Imports
# ------------------------------------------------------------
from google.cloud import storage
from google.oauth2 import service_account

from utils.bigquery_utils import query_bq, update_bq
from config import BQ_PROJECT, BQ_DATASET

# ------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------
TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
bucket_name = "ratecard-media"

print("Project:", BQ_PROJECT)
print("Dataset:", BQ_DATASET)
print("Table:", TABLE_NEWS)
print("Bucket:", bucket_name)
print("--------------------------------------------------")

# ------------------------------------------------------------
# AUTH (exactement comme BigQuery)
# ------------------------------------------------------------
credentials_path = os.environ.get("GOOGLE_CREDENTIALS_FILE")

if not credentials_path:
    raise ValueError("GOOGLE_CREDENTIALS_FILE non défini")

with open(credentials_path, "r") as f:
    info = json.load(f)

credentials = service_account.Credentials.from_service_account_info(info)

storage_client = storage.Client(
    credentials=credentials,
    project=info.get("project_id"),
)

bucket = storage_client.bucket(bucket_name)

# ------------------------------------------------------------
# Récupération des news publiées
# ------------------------------------------------------------
rows = query_bq(f"""
    SELECT ID_NEWS, MEDIA_RECTANGLE_ID
    FROM `{TABLE_NEWS}`
    WHERE STATUS = 'PUBLISHED'
""")

print(f"Total published news: {len(rows)}")

migrated = 0
skipped = 0

# ------------------------------------------------------------
# Migration
# ------------------------------------------------------------
for row in rows:
    news_id = row["ID_NEWS"]
    media_id = row["MEDIA_RECTANGLE_ID"]

    if not media_id:
        skipped += 1
        continue

    # On ne migre que les anciens visuels société
    if media_id.startswith("COMPANY_"):

        print("Migrating:", news_id)

        source_blob = bucket.blob(f"companies/{media_id}")

        if not source_blob.exists():
            print("⚠ Missing source:", media_id)
            skipped += 1
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

        migrated += 1
    else:
        skipped += 1

print("--------------------------------------------------")
print("Migration finished.")
print("Migrated:", migrated)
print("Skipped:", skipped)
