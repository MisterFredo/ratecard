import re
from typing import List, Dict
from utils.llm import run_llm


# ============================================================
# ANGLE LENSES — points de vue éditoriaux
# ============================================================
ANGLE_LENSES = [
    "interface et expérience utilisateur",
    "attribution et mesure de la performance",
    "donnée produit et compétitivité des marques",
]


# ============================================================
# PROPOSE ANGLES — MULTI PASS IA
# ============================================================
def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
) -> List[Dict[str, str]]:
    """
    Propose plusieurs angles mono-signal via appels IA successifs.
    Jamais de retour vide si la source est non vide.
    """

    if not isinstance(source_text, str) or not source_text.strip():
        return []

    angles: List[Dict[str, str]] = []

    for lens in ANGLE_LENSES:
        prompt = f"""
Tu es un analyste éditorial spécialisé en contenus liés
au marketing digital, à l’Adtech, au Martech et au Retail Media.

À partir de la source ci-dessous, identifie UN SEUL angle éditorial,
mono-signal, en te concentrant UNIQUEMENT sur le point de vue suivant :

👉 {lens}

Contraintes :
- Un seul angle.
- Ne fusionne pas plusieurs idées.
- Ne reformule pas la source.
- Ne produis aucun commentaire.

FORMAT ATTENDU :

Titre : ...
Signal : ...

SOURCE :
{source_text}
"""

        raw = run_llm(prompt)
        angle = parse_single_angle(raw)

        if angle:
            angles.append(angle)

    # ---------------------------------------------------------
    # FALLBACK FINAL — continuité UX
    # ---------------------------------------------------------
    if not angles:
        return [{
            "angle_title": source_text.strip().split("\n")[0][:120],
            "angle_signal": source_text.strip()[:300],
        }]

    return angles


# ============================================================
# PARSE UN ANGLE UNIQUE (robuste)
# ============================================================
def parse_single_angle(text: str):
    if not isinstance(text, str):
        return None

    title_match = re.search(
        r"Titre\s*:\s*(.+)",
        text,
        flags=re.IGNORECASE,
    )

    signal_match = re.search(
        r"Signal\s*:\s*(.+)",
        text,
        flags=re.IGNORECASE,
    )

    if title_match and signal_match:
        return {
            "angle_title": title_match.group(1).strip(),
            "angle_signal": signal_match.group(1).strip(),
        }

    return None
