from typing import List, Dict

from utils.llm import run_llm

# ⚠️ on va brancher ça après
# import des fetchers (on sécurise)
from core.numbers.insight_service import get_numbers_by_ids
from core.insight.service import get_analysis_details_by_ids

# ⚠️ prompt builder (on le crée étape 2)
from core.transformation.prompts import build_prompt


# ============================================================
# MAIN TRANSFORMATION PIPELINE
# ============================================================

def run_transformation_pipeline(
    ids: List[str],
    mode: str
) -> Dict:

    if not ids:
        return {
            "status": "empty",
            "result": "",
        }

    # ========================================================
    # FETCH DATA
    # ========================================================

    if mode == "numbers":
        data = get_numbers_by_ids(ids)

    elif mode == "feed":
        data = get_analysis_details_by_ids(ids)

    else:
        raise ValueError(f"Mode inconnu: {mode}")

    # ========================================================
    # BUILD PROMPT
    # ========================================================

    prompt = build_prompt(
        mode=mode,
        data=data
    )

    # ========================================================
    # LLM CALL
    # ========================================================

    result = run_llm(
        prompt=prompt,
        temperature=0.2,
    )

    return {
        "status": "ok",
        "result": result or "",
    }
