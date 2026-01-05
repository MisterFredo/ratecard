from typing import Dict, List
from core.lab_content.angles import propose_angles
from core.lab_content.service import transform_source_to_content


# ============================================================
# ANGLES — étape 1
# ============================================================
def generate_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
):
    return propose_angles(
        source_type=source_type,
        source_text=source_text,
        context=context,
    )


# ============================================================
# CONTENT — étape 2
# ============================================================
def generate_content(
    source_type: str,
    source_text: str,
    angle_title: str,
    angle_signal: str,
    context: Dict[str, List[str]],
):
    return transform_source_to_content(
        source_type=source_type,
        source_text=source_text,
        angle_title=angle_title,
        angle_signal=angle_signal,
        context=context,
    )
