from fastapi import APIRouter, HTTPException

from api.synthesis.models import (
    SynthesisCreate,
    SynthesisAttachContents,
    SynthesisCandidatesQuery,
    SynthesisModelCreate,
    SynthesisModelUpdate,
)

from core.synthesis.service import (
    list_candidate_contents,
    create_synthesis,
    attach_contents_to_synthesis,
    get_synthesis_preview,
)

from core.synthesis.model_service import (
    list_models,
    create_model,
    update_model,
)

router = APIRouter()

# ============================================================
# LIST SYNTHESIS MODELS (ADMIN)
# ============================================================
@router.get("/models")
def list_synthesis_models():
    try:
        models = list_models()
        return {"status": "ok", "models": models}
    except Exception as e:
        raise HTTPException(
            400, f"Erreur chargement modèles : {e}"
        )

# ============================================================
# CREATE MODEL (ADMIN)
# ============================================================
@router.post("/models")
def create_synthesis_model(payload: SynthesisModelCreate):
    try:
        id_model = create_model(
            name=payload.name,
            topic_ids=payload.topic_ids,
            company_ids=payload.company_ids,
        )
        return {"status": "ok", "id_model": id_model}
    except Exception as e:
        raise HTTPException(
            400, f"Erreur création modèle : {e}"
        )

# ============================================================
# UPDATE MODEL (ADMIN)
# ============================================================
@router.put("/models/{id_model}")
def update_synthesis_model(
    id_model: str,
    payload: SynthesisModelUpdate,
):
    try:
        update_model(
            id_model=id_model,
            name=payload.name,
            topic_ids=payload.topic_ids,
            company_ids=payload.company_ids,
        )
        return {"status": "ok", "updated": True}
    except Exception as e:
        raise HTTPException(
            400, f"Erreur mise à jour modèle : {e}"
        )

# ============================================================
# LIST CANDIDATE CONTENTS (ADMIN)
# ============================================================
@router.post("/candidates")
def list_candidates(payload: SynthesisCandidatesQuery):
    try:
        contents = list_candidate_contents(
            topic_ids=payload.topic_ids or [],
            company_ids=payload.company_ids or [],
            date_from=payload.date_from,
            date_to=payload.date_to,
        )
        return {"status": "ok", "contents": contents}
    except Exception as e:
        raise HTTPException(400, f"Erreur candidates synthèse : {e}")

# ============================================================
# CREATE SYNTHESIS
# ============================================================
@router.post("/create")
def create_synthesis_route(payload: SynthesisCreate):
    try:
        id_synthesis = create_synthesis(
            id_model=payload.id_model,
            synthesis_type=payload.synthesis_type,
            date_from=payload.date_from,
            date_to=payload.date_to,
        )
        return {"status": "ok", "id_synthesis": id_synthesis}
    except Exception as e:
        raise HTTPException(400, f"Erreur création synthèse : {e}")

# ============================================================
# ATTACH CONTENTS TO SYNTHESIS
# ============================================================
@router.post("/{id_synthesis}/contents")
def attach_contents_route(id_synthesis: str, payload: SynthesisAttachContents):
    try:
        if len(payload.content_ids) > 5:
            raise ValueError("Maximum 5 analyses par synthèse")

        attach_contents_to_synthesis(
            id_synthesis=id_synthesis,
            content_ids=payload.content_ids,
        )
        return {"status": "ok", "attached": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur association contenus : {e}")

# ============================================================
# LIST SYNTHESIS (ADMIN)
# ============================================================
@router.get("/list")
def list_syntheses():
    try:
        rows = query_bq(
            f"""
            SELECT
              S.ID_SYNTHESIS,
              M.NAME AS MODEL_NAME,
              S.TYPE,
              S.DATE_FROM,
              S.DATE_TO,
              S.STATUS,
              S.CREATED_AT
            FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS` S
            LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS_MODEL` M
              ON S.ID_MODEL = M.ID_MODEL
            ORDER BY
              S.CREATED_AT DESC
            """
        )

        return {
            "status": "ok",
            "syntheses": [
                {
                    "ID_SYNTHESIS": r["ID_SYNTHESIS"],
                    "NAME": r["MODEL_NAME"],
                    "TYPE": r["TYPE"],
                    "DATE_FROM": r.get("DATE_FROM"),
                    "DATE_TO": r.get("DATE_TO"),
                    "STATUS": r["STATUS"],
                    "CREATED_AT": r["CREATED_AT"],
                }
                for r in rows
            ],
        }

    except Exception as e:
        raise HTTPException(
            400,
            f"Erreur chargement synthèses : {e}",
        )

# ============================================================
# PREVIEW SYNTHESIS (ADMIN)
# ============================================================
@router.get("/{id_synthesis}/preview")
def preview_synthesis_route(id_synthesis: str):
    try:
        preview = get_synthesis_preview(id_synthesis)
        return {"status": "ok", "synthesis": preview}
    except Exception as e:
        raise HTTPException(400, f"Erreur preview synthèse : {e}")
