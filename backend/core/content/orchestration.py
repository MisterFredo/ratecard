from typing import Dict, List, Optional
from core.lab_content.angles import propose_angles
from core.lab_content.service import transform_source_to_content


# ============================================================
# ANGLES — étape 1
# ============================================================
def generate_angles(
    source_type: Optional[str],
    source_text: str,
    context: Dict[str, List[str]],
):
    return propose_angles(
        source_type=source_type,
        source_text=source_text,
        context=context,
    )


# ============================================================
# CONTENT — étape 2 (alignée avec /ai/generate)
# ============================================================
def generate_content(
    angle_title: str,
    angle_signal: str,
    source_type: Optional[str] = None,
    source_text: str = "",
    context: Dict[str, List[str]] = {},
):
    """
    Génère le contenu à partir d’un angle validé.
    Les champs source / contexte sont optionnels à ce stade.
    """

    return transform_source_to_content(
        source_type=source_type,
        source_text=source_text,
        angle_title=angle_title,
        angle_signal=angle_signal,
        context=context,
    )

