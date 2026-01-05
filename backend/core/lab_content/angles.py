import re
from typing import List, Dict
from utils.llm import run_llm


# ============================================================
# ANGLES — IA → STUDIO (ROBUSTE)
# ============================================================
def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
) -> List[Dict[str, str]]:
    """
    Propose 1 à 3 angles mono-signal exploitables.
    Jamais de retour vide si l'IA a répondu.
    """

    prompt = f"""
Tu es un agent éditorial ADEX.

À partir de la source ci-dessous, IDENTIFIE ENTRE 2 ET 3 ANGLES DISTINCTS.
Chaque angle doit traiter UN SEUL SIGNAL.

⚠️ RÈGLE CRITIQUE :
- Ne fusionne jamais plusieurs idées dans un même angle.
- Si la source contient plusieurs enjeux, ils DOIVENT être séparés.
- Il est préférable de proposer 3 angles simples plutôt qu’un seul angle global.

Pour CHAQUE angle, fournis :
- Titre : une accroche claire et spécifique
- Signal : une phrase qui décrit précisément l’enjeu

FORMAT ATTENDU (obligatoire) :

ANGLE
Titre : ...
Signal : ...

ANGLE
Titre : ...
Signal : ...

SOURCE :
{source_text}


SOURCE :
{source_text}
"""

    raw = run_llm(prompt)

    # Log temporaire si besoin
    # print("RAW ANGLES OUTPUT:", raw)

    angles = parse_angles_text(raw)

    # 🔑 FALLBACK CRITIQUE (hérité de lab_light)
    if not angles and isinstance(raw, str) and raw.strip():
        return [{
            "angle_title": raw.strip().split("\n")[0][:120],
            "angle_signal": raw.strip()[:300],
        }]

    return angles


def parse_angles_text(text: str) -> List[Dict[str, str]]:
    """
    Parse tolérant des sorties LLM réelles.
    Accepte puces, variations lexicales, formats libres.
    """
    if not isinstance(text, str):
        return []

    angles = []

    # Découpage large (ANGLE, puces, tirets)
    blocks = re.split(
        r"(?:\n\s*ANGLE\s+\d+|\n\s*[•🔹\-])",
        text,
        flags=re.IGNORECASE,
    )

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        title_match = re.search(
            r"(?:Titre\s*(?:provisoire)?\s*:)(.+)",
            block,
            flags=re.IGNORECASE,
        )

        signal_match = re.search(
            r"(?:Signal\s*(?:résumé)?\s*:)(.+)",
            block,
            flags=re.IGNORECASE,
        )

        if title_match and signal_match:
            angles.append({
                "angle_title": title_match.group(1).strip(),
                "angle_signal": signal_match.group(1).strip(),
            })

    return angles
