import sys
import os
import json

# ------------------------------------------------------------
# Import utils / config
# ------------------------------------------------------------
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)

from google.cloud import storage
from google.oauth2 import service_account

from utils.bigquery_utils import query_bq, update_bq
from config import BQ_PROJECT

# ------------------------------------------------------------
# CONFIG PROD FORCÉ
# ------------------------------------------------------------

BQ_DATASET = "RATECARD_PROD"
TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"

bucket_name = "ratecard-media"

# 🔥 IMPORTANT
DRY_RUN = True   # Mets False pour exécuter réellement

print("--------------------------------------------------")
print("PROJECT:", BQ_PROJECT)
print("DATASET:", BQ_DATASET)
print("TABLE_NEWS:", TABLE_NEWS)
print("BUCKET:", bucket_name)
print("DRY_RUN:", DRY_RUN)
print("--------------------------------------------------")

# ------------------------------------------------------------
# AUTH
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
# Récupération des news à migrer
# ------------------------------------------------------------

rows = query_bq(f"""
    SELECT
        n.ID_NEWS,
        n.ID_COMPANY,
        c.MEDIA_LOGO_RECTANGLE_ID
    FROM `{TABLE_NEWS}` n
    LEFT JOIN `{TABLE_COMPANY}` c
        ON n.ID_COMPANY = c.ID_COMPANY
    WHERE n.STATUS = 'PUBLISHED'
    AND (n.MEDIA_RECTANGLE_ID IS NULL OR n.MEDIA_RECTANGLE_ID = '')
""")

print(f"News à migrer: {len(rows)}")

migrated = 0
skipped = 0
errors = 0

# ------------------------------------------------------------
# MIGRATION
# ------------------------------------------------------------

for row in rows:

    news_id = row["ID_NEWS"]
    company_media_id = row["MEDIA_LOGO_RECTANGLE_ID"]

    if not company_media_id:
        print(f"⚠ Pas de visuel société pour news {news_id}")
        skipped += 1
        continue

    source_path = f"companies/{company_media_id}"
    new_filename = f"NEWS_{news_id}_rect.jpg"
    destination_path = f"news/{new_filename}"

    source_blob = bucket.blob(source_path)
    destination_blob = bucket.blob(destination_path)

    if not source_blob.exists():
        print(f"⚠ Source introuvable: {source_path}")
        skipped += 1
        continue

    if destination_blob.exists():
        print(f"⚠ Destination déjà existante: {destination_path}")
        skipped += 1
        continue

    print(f"→ Migrating {news_id}")

    if not DRY_RUN:
        try:
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

        except Exception as e:
            print(f"❌ Erreur migration {news_id}: {e}")
            errors += 1
    else:
        migrated += 1

print("--------------------------------------------------")
print("FINISHED")
print("Migrated:", migrated)
print("Skipped:", skipped)
print("Errors:", errors)
print("--------------------------------------------------")
