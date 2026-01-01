import os, json
from google.cloud import storage

_credentials_json = os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"]
_bucket_name = os.environ["GCS_BUCKET_NAME"]

client = storage.Client.from_service_account_info(json.loads(_credentials_json))
bucket = client.bucket(_bucket_name)

def upload_bytes(path: str, content: bytes) -> str:
    blob = bucket.blob(path)
    blob.upload_from_string(content, content_type="image/jpeg")
    blob.make_public()
    return blob.public_url
