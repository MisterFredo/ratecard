from fastapi import APIRouter, HTTPException

from api.synthesis.models import (
    SynthesisCreate,
    SynthesisAttachContents,
    SynthesisCandidatesQuery,
    SynthesisModelCreate,
    SynthesisModelUpdate,
)

from core.synthesis.service import (
    list_candidate_contents,     # lecture pure
    create_synthesis,            # création finale uniquement
    attach_contents_to_synthesis,
    get_synthesis_preview,
    list_syntheses,              # inventaire (lecture seule)
)

from core.synthesis.model_service import (
    list_models,
    create_model,
    update_model,
)

router = APIRouter()

# ============================================================
# SYNTHESIS MODELS (ADMIN)
# ============================================================

@router.get("/models")
def list_synthesis_models():
    """Liste des modèles de synthèse (ADMIN)."""
    try:
        models = list_models()
        return {"status": "ok", "models": models}
    except Exception as e:
        raise HTTPException(400, f"Erreur chargement modèles : {e}")


@router.post("/models")
def create_synthesis_model(payload: SynthesisModelCreate):
    """Création d’un modèle de synthèse (ADMIN)."""
    try:
        id_model = create_model(
            name=payload.name,
            topic_ids=payload.topic_ids,
            company_ids=payload.company_ids,
        )
        return {"status": "ok", "id_model": id_model}
    except Exception as e:
        raise HTTPException(400, f"Erreur création modèle : {e}")


@router.put("/models/{id_model}")
def update_synthesis_model(id_model: str, payload: SynthesisModelUpdate):
    """Mise à jour d’un modèle de synthèse (ADMIN)."""
    try:
        update_model(
            id_model=id_model,
            name=payload.name,
            topic_ids=payload.topic_ids,
            company_ids=payload.company_ids,
        )
        return {"status": "ok", "updated": True}
    except Exception as e:
        raise HTTPException(400, f"Erreur mise à jour modèle : {e}")


# ============================================================
# SYNTHESIS — LECTURE (ADMIN)
# ============================================================

@router.post("/candidates")
def list_candidates(payload: SynthesisCandidatesQuery):
    try:
        contents = list_candidate_contents(
            topic_ids=payload.topic_ids or [],
            company_ids=payload.company_ids or [],
            date_from=payload.date_from.isoformat(),  # 👈 FIX
            date_to=payload.date_to.isoformat(),      # 👈 FIX
        )
        return {"status": "ok", "contents": contents}
    except Exception as e:
        raise HTTPException(400, f"Erreur candidates synthèse : {e}")

@router.get("/list")
def list_syntheses_route():
    """
    Inventaire des synthèses existantes (ADMIN).

    Lecture seule :
    - pas d’édition
    - pas de suppression
    """
    try:
        syntheses = list_syntheses()
        return {"status": "ok", "syntheses": syntheses}
    except Exception as e:
        raise HTTPException(400, f"Erreur chargement synthèses : {e}")


@router.get("/{id_synthesis}/preview")
def preview_synthesis_route(id_synthesis: str):
    """Aperçu d’une synthèse (ADMIN)."""
    try:
        preview = get_synthesis_preview(id_synthesis)
        return {"status": "ok", "synthesis": preview}
    except Exception as e:
        raise HTTPException(400, f"Erreur preview synthèse : {e}")


# ============================================================
# SYNTHESIS — ÉCRITURE FINALE (ADMIN)
# ============================================================

@router.post("/create")
def create_synthesis_route(payload: SynthesisCreate):
    """
    Création finale d’une synthèse.

    ⚠️ Appelée UNIQUEMENT après validation humaine
    (sélection des analyses).
    """
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


@router.post("/{id_synthesis}/contents")
def attach_contents_route(id_synthesis: str, payload: SynthesisAttachContents):
    """
    Association des analyses à une synthèse.

    - max 5 analyses
    - étape finale avant aperçu
    """
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

