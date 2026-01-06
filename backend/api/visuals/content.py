from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
from io import BytesIO
from openai import OpenAI
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
    - du visuel rectangulaire d’un Topic (logique éditoriale)
    - de l’angle
    - de l’excerpt

    ⚠️ Pour l’instant : génération TEXT → IMAGE
    (pas encore image → image, voir note plus bas)
    """
    try:
        # --------------------------------------------------
        # VALIDATIONS
        # --------------------------------------------------
        if not payload.angle_title or not payload.angle_title.strip():
            raise HTTPException(400, "Angle requis")

        if not payload.excerpt or not payload.excerpt.strip():
            raise HTTPException(400, "Excerpt requis")

        client = get_bigquery_client()

        # --------------------------------------------------
        # RÉCUPÉRER LE VISUEL DU TOPIC (LOGIQUE ÉDITORIALE)
        # --------------------------------------------------
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

        # --------------------------------------------------
        # PROMPT DE DIRECTION ARTISTIQUE (TRÈS CONTRAINT)
        # --------------------------------------------------
        prompt = f"""
Tu es l’illustrateur officiel de Ratecard.

IMPORTANT :
Tu dois produire une illustration STRICTEMENT DANS LE STYLE GRAPHIQUE SUIVANT :

STYLE GRAPHIQUE OBLIGATOIRE
- illustration dessinée à la main / cartoon
- traits noirs épais et continus
- formes simples et expressives
- style flat, vectoriel
- PAS de photoréalisme
- PAS de 3D
- PAS de style corporate ou stock image
- PAS de gradients complexes
- fond très clair ou texture papier
- palette limitée : bleu foncé, bleu clair, gris, blanc, noir

PERSONNAGE CENTRAL (OBLIGATOIRE)
- un personnage unique et reconnaissable
- visage simple et expressif
- cheveux stylisés
- tenue bleue avec cape ou tunique
- posture dynamique (action, mouvement, interaction)
- le personnage DOIT être présent et central dans l’image

UNIVERS VISUEL
- métaphores visuelles simples
- icônes schématiques
- graphiques simplifiés
- éléments flottants autour du personnage
- style pédagogique / explicatif

SUJET DE L’ILLUSTRATION
Angle :
"{payload.angle_title}"

Accroche :
"{payload.excerpt}"

Le visuel doit illustrer le concept de manière métaphorique,
pas littérale, en restant cohérent avec l’univers graphique Ratecard.

CONTRAINTES STRICTES
- aucun texte lisible dans l’image
- aucune marque réelle
- aucune photo
- aucune typographie
- style homogène avec les visuels existants Ratecard (Retail Media / IA)

OBJECTIF
Créer un visuel éditorial reconnaissable immédiatement
comme appartenant à l’univers Ratecard.
"""

        # --------------------------------------------------
        # GÉNÉRATION IA (TEXT → IMAGE)
        # --------------------------------------------------
        client_ai = OpenAI()

        result = client_ai.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024",
        )

        base = base64.b64decode(result.data[0].b64_json)

        # --------------------------------------------------
        # NORMALISATION RECTANGLE (1200x630, crop centré)
        # --------------------------------------------------
        rect_bytes = to_rectangle(base)

        filename = f"CONTENT_{payload.id_content}_AI_rect.jpg"
        upload_bytes(GCS_FOLDER, filename, rect_bytes)

        # --------------------------------------------------
        # UPDATE CONTENT
        # --------------------------------------------------
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

    except HTTPException as e:
        print("❌ HTTPException generate-ai:", e.detail)
        raise

    except Exception as e:
        import traceback
        print("❌ generate-ai UNCAUGHT EXCEPTION")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "error": "content_visual_ai_failed",
                "message": repr(e),
            }
        )



