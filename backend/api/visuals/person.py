# backend/api/visuals/person.py

from fastapi import APIRouter, Form, UploadFile
from api.visuals.gcs_service import upload_bytes
from api.visuals.utils import insert_visual
from api.visuals.models import VisualUploadResponse
from utils.bigquery_utils import get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET

import sharp  # ❗ uniquement si sharp-python installé (sinon on fera version pillow)
from uuid import uuid4

from PIL import Image
import io

router = APIRouter()

# ---------------------------------------------------------------------------
# Helpers de transformation d’image
# ---------------------------------------------------------------------------

def to_jpeg(buffer: bytes) -> bytes:
    """Convertit en JPEG propre."""
    img = Image.open(io.BytesIO(buffer)).convert("RGB")
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=92)
    return out.getvalue()


def make_rectangle(buffer: bytes) -> bytes:
    """1200×900 crop."""
    img = Image.open(io.BytesIO(buffer)).convert("RGB")
    img = img.resize((1200, 900))
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=88)
    return out.getvalue()


def make_square(buffer: bytes) -> bytes:
    """600×600 crop."""
    img = Image.open(io.BytesIO(buffer)).convert("RGB")
    img = img.resize((600, 600))
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=88)
    return out.getvalue()


# ---------------------------------------------------------------------------
# POST /api/visuals/person/upload-photo
# ---------------------------------------------------------------------------

@router.post("/upload-photo", response_model=VisualUploadResponse)
async def upload_person_photo(
    id_person: str = Form(...),
    title: str = Form(...),
    file: UploadFile = Form(...)
):
    """
    Upload d'une photo d'intervenant :
    - Crée original / rect / square
    - Upload dans GCS
    - Enregistre les 3 versions dans BigQuery (attachées à la personne)
    """

    raw = await file.read()

    # Génération formats
    jpeg_original = to_jpeg(raw)
    jpeg_rect = make_rectangle(raw)
    jpeg_square = make_square(raw)

    # Nommage GCS
    safe_title = title.replace(" ", "_")
    base = f"persons/{id_person}/{safe_title}"

    fp_original = f"{base}_original.jpg"
    fp_rect = f"{base}_rect.jpg"
    fp_square = f"{base}_square.jpg"

    # Upload sur GCS
    url_original = upload_bytes(fp_original, jpeg_original)
    url_rect = upload_bytes(fp_rect, jpeg_rect)
    url_square = upload_bytes(fp_square, jpeg_square)

    # Enregistrement BigQuery
    mid_original = insert_visual("original", "person", id_person, fp_original, title)
    mid_rect = insert_visual("rectangle", "person", id_person, fp_rect, title)
    mid_square = insert_visual("square", "person", id_person, fp_square, title)

    # Mise à jour RATECARD_PERSON
    client = get_bigquery_client()
    client.query(f"""
        UPDATE `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON`
        SET MEDIA_PICTURE_RECTANGLE_ID = '{mid_rect}',
            MEDIA_PICTURE_SQUARE_ID = '{mid_square}'
        WHERE ID_PERSON = '{id_person}'
    """)

    return VisualUploadResponse(
        media_id_original=mid_original,
        media_id_rect=mid_rect,
        media_id_square=mid_square,
        url_original=url_original,
        url_rect=url_rect,
        url_square=url_square
    )
