from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image

from google.cloud import bigquery
from utils.bigquery_utils import get_bigquery_client
from utils.gcs import upload_bytes, delete_file
from config import BQ_PROJECT, BQ_DATASET

router = APIRouter()

TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
GCS_FOLDER = "contents"


# ============================================================
# MODELS
# ============================================================

class ContentVisualUpload(BaseModel):
    id_content: str
    base64_image: str


class ContentVisualReset(BaseModel):
    id_content: str


# ============================================================
# IMAGE UTILS
# ============================================================

def to_rectangle(img_bytes: bytes) -> bytes:
    """
    Génère un visuel rectangulaire 1200x630
    avec crop centré intelligent (même logique que Topic).
    """
    img = Image.open(BytesIO(img_bytes)).convert("RGB")

    target_ratio = 1200 / 630
    img_ratio = img.width / img.height

    if img_ratio > target_ratio:
        # Image trop large → crop horizontal
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        rect = img.crop((left, 0, left + new_width, img.height))
    else:
        # Image trop haute → crop vertical
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        rect = img.crop((0, top, img.width, top + new_height))

    rect = rect.resize((1200, 630), Image.LANCZOS)

    buf = BytesIO()
    rect.save(buf, format="JPEG", quality=90)

    return buf.getvalue()



# ============================================================
# UPLOAD MANUEL VISUEL CONTENT
# ============================================================

@router.post("/upload")
def upload_content_visual(payload: ContentVisualUpload):
    try:
        try:
            img_bytes = base64.b64decode(payload.base64_image)
        except Exception:
            raise HTTPException(400, "Base64 invalide")

        rect_bytes = to_rectangle(img_bytes)
        filename = f"CONTENT_{payload.id_content}_rect.jpg"

        upload_bytes(GCS_FOLDER, filename, rect_bytes)

        client = get_bigquery_client()
        client.query(
            f"""
            UPDATE `{TABLE_CONTENT}`
            SET
                MEDIA_RECTANGLE_ID = @fname,
                VISUAL_SOURCE_TYPE = "CONTENT",
                VISUAL_SOURCE_ID = @id
            WHERE ID_CONTENT = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_content),
                ]
            )
        ).result()

        return {"status": "ok", "filename": filename}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "content_visual_upload_failed",
                "message": str(e),
            }
        )


# ============================================================
# RESET VISUEL CONTENT
# ============================================================

@router.post("/reset")
def reset_content_visual(payload: ContentVisualReset):
    try:
        client = get_bigquery_client()

        rows = client.query(
            f"""
            SELECT MEDIA_RECTANGLE_ID
            FROM `{TABLE_CONTENT}`
            WHERE ID_CONTENT = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_content),
                ]
            )
        ).result()

        old_file = None
        for r in rows:
            old_file = r["MEDIA_RECTANGLE_ID"]

        if old_file:
            delete_file(GCS_FOLDER, old_file)

        client.query(
            f"""
            UPDATE `{TABLE_CONTENT}`
            SET MEDIA_RECTANGLE_ID = NULL
            WHERE ID_CONTENT = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_content),
                ]
            )
        ).result()

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "content_visual_reset_failed",
                "message": str(e),
            }
        )

class ContentAIGenerate(BaseModel):
    id_content: str
    id_topic: str
    angle_title: str
    excerpt: str


@router.post("/generate-ai")
def generate_ai_content_visual(payload: ContentAIGenerate):
    """
    Génère un visuel Content à partir :
    - du visuel rectangulaire d’un Topic
    - de l’angle
    - de l’excerpt
    """
    try:
        if not payload.angle_title.strip():
            raise HTTPException(400, "Angle requis")

        if not payload.excerpt.strip():
            raise HTTPException(400, "Excerpt requis")

        client = get_bigquery_client()

        # --- récupérer le visuel du topic
        rows = client.query(
            f"""
            SELECT MEDIA_RECTANGLE_ID
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC`
            WHERE ID_TOPIC = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_topic),
                ]
            )
        ).result()

        topic_image = None
        for r in rows:
            topic_image = r["MEDIA_RECTANGLE_ID"]

        if not topic_image:
            raise HTTPException(400, "Le topic n’a pas de visuel")

        # --- génération IA
        client_ai = OpenAI()

        prompt = f"""
Tu es l’illustrateur officiel Ratecard.

Crée une image moderne et professionnelle à partir du contexte suivant.

Angle :
"{payload.angle_title}"

Accroche :
"{payload.excerpt}"

Contraintes graphiques :
- fond clair
- ligne sobre
- bleu Ratecard (#10323d)
- aucun texte lisible
"""

        result = client_ai.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024",
            response_format="b64_json",
        )

        base = base64.b64decode(result.data[0].b64_json)
        rect_bytes = to_rectangle(base)

        filename = f"CONTENT_{payload.id_content}_AI_rect.jpg"
        upload_bytes(GCS_FOLDER, filename, rect_bytes)

        # --- update content
        client.query(
            f"""
            UPDATE `{TABLE_CONTENT}`
            SET
                MEDIA_RECTANGLE_ID = @fname,
                VISUAL_SOURCE_TYPE = "AI_TOPIC",
                VISUAL_SOURCE_ID = @topic
            WHERE ID_CONTENT = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("fname", "STRING", filename),
                    bigquery.ScalarQueryParameter("topic", "STRING", payload.id_topic),
                    bigquery.ScalarQueryParameter("id", "STRING", payload.id_content),
                ]
            )
        ).result()

        return {"status": "ok", "filename": filename}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "content_visual_ai_failed",
                "message": str(e),
            }
        )

