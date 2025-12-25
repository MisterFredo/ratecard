# backend/api/lab_light/routes.py

from fastapi import APIRouter, HTTPException
from core.lab_light.service import transform_source

router = APIRouter()

@router.post("/transform")
def transform(payload: dict):
    try:
        source_type = payload.get("source_type")
        source_text = payload.get("source_text")
        author = payload.get("author")

        if not source_type or not source_text:
            raise HTTPException(400, "Champ source_type et source_text obligatoires.")

        result = transform_source(source_type, source_text, author or "")

        return {"status": "ok", "draft": result}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Erreur LAB Light : {e}")
