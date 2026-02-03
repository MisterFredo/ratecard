# backend/api/visuals/company.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import base64
from io import BytesIO
import uuid

from PIL import Image
from google.cloud import bigquery

from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
GCS_FOLDER = "companies"
GCS_PUBLIC_BASE_URL = "https://storage.googleapis.com/ratecard-assets"


class CompanyVisualUpload(BaseModel):
    id_company: str
    base64_image: str


class CompanyVisualReset(BaseModel):
    id_company: str


def generate_logo(image_bytes: bytes) -> bytes:
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((800, 400), Image.LANCZOS)

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


@router.post("/upload")
def upload_company_visual(payload: CompanyVisualUpload):
    try:
        image_bytes = base64.b64decode(payload.base64_image)

        logo_bytes = generate_logo(image_bytes)

        # 🔥 VERSIONNEMENT — CLÉ DU FIX
        logo_filename = (
            f"COMPANY_{payload.id_company}_logo_{uuid.uuid4().hex}.jpg"
        )

        upload_bytes(GCS_FOLDER, logo_filename, logo_bytes)

        client = get_bigquery_client()
        sql = f"""
            UPDATE `{TABLE_COMPANY}`
            SET
                MEDIA_LOGO_RECTANGLE_ID = @logo,
                UPDATED_AT = @now
            WHERE ID_COMPANY = @id
        """

        client.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("logo", "STRING", logo_filename),
                    bigquery.ScalarQueryParameter("now", "TIMESTAMP", datetime.utcnow()),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_company),
                ]
            )
        ).result()

        return {
            "status": "ok",
            "public_url": f"{GCS_PUBLIC_BASE_URL}/{GCS_FOLDER}/{logo_filename}",
        }

    except Exception as e:
        raise HTTPException(400, str(e))
