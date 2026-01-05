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
Tu es un agent éditorial ADEX spécialiste en marketing digital et plus spécifiquement sur les univers Adtech, Martech, Retail et IA appliquée au marketing.

À partir de la source ci-dessous, propose entre 1 et 3 ANGLES mono-signal exploitables.

Pour chaque angle, fournis :
- un titre
- un signal résumé en une phrase

Ne rédige aucun autre texte.

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
