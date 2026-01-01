from fastapi import APIRouter, UploadFile, Form
from api.visuals.gcs_service import upload_bytes
from api.visuals.utils import insert_visual
from api.visuals.models import VisualUploadResponse
from utils.bigquery_utils import get_bigquery_client

router = APIRouter()

@router.post("/upload-logo", response_model=VisualUploadResponse)
async def upload_company_logo(
    id_company: str = Form(...),
    title: str = Form(...),
    file: UploadFile = Form(...)
):
    # lecture fichier
    content = await file.read()

    # chemins GCS
    base = f"companies/{id_company}/{title}"
    fp_original = f"{base}_original.jpg"
    fp_rect = f"{base}_rect.jpg"
    fp_square = f"{base}_square.jpg"

    # upload
    url_original = upload_bytes(fp_original, content)
    url_rect = upload_bytes(fp_rect, content)
    url_square = upload_bytes(fp_square, content)

    # BQ
    mid_original = insert_visual("original", "company", id_company, fp_original, title)
    mid_rect = insert_visual("rectangle", "company", id_company, fp_rect, title)
    mid_square = insert_visual("square", "company", id_company, fp_square, title)

    # update RATECARD_COMPANY
    client = get_bigquery_client()
    client.query(f"""
        UPDATE `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY`
        SET MEDIA_LOGO_RECTANGLE_ID = '{mid_rect}',
            MEDIA_LOGO_SQUARE_ID = '{mid_square}'
        WHERE ID_COMPANY = '{id_company}'
    """)

    return VisualUploadResponse(
        media_id_original=mid_original,
        media_id_rect=mid_rect,
        media_id_square=mid_square,
        url_original=url_original,
        url_rect=url_rect,
        url_square=url_square
    )
