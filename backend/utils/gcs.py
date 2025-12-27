from google.cloud import storage
import json
import os
from datetime import datetime
from uuid import uuid4

# Chargement des credentials JSON depuis la variable d’env Render
_credentials_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if not _credentials_json:
    raise RuntimeError("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON")

credentials_info = json.loads(_credentials_json)

storage_client = storage.Client.from_service_account_info(credentials_info)

BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME")
BASE_URL = os.environ.get("GCS_BASE_URL")

bucket = storage_client.bucket(BUCKET_NAME)


def upload_bytes(folder: str, filename: str, data: bytes) -> str:
    """
    Upload un fichier binaire dans GCS.
    Retourne l’URL publique GCS.
    """
    path = f"{folder}/{filename}"
    blob = bucket.blob(path)

    blob.upload_from_string(data, content_type="image/jpeg")

    # Rendre public
    blob.make_public()

    return f"{BASE_URL}/{path}"


def delete_file(folder: str, filename: str):
    """
    Supprime un fichier dans GCS.
    """
    path = f"{folder}/{filename}"
    blob = bucket.blob(path)

    if blob.exists():
        blob.delete()
        return True

    return False
