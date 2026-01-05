import re
from typing import List, Dict
from utils.llm import run_llm


def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
) -> List[Dict[str, str]]:
    """
    Propose 1 à 3 angles mono-signal exploitables.
    Sortie texte, parsing tolérant.
    """

    prompt = f"""
Tu es un agent éditorial ADEX spécialiste en marketing digital et notamment dans la AdTech, la MarTech, le Retail Média et l'IA appliquée au marketing.

À partir de la source ci-dessous, propose entre 1 et 3 ANGLES mono-signal exploitables.

Pour chaque angle, fournis :
- un titre
- un signal résumé en une phrase

Ne rédige aucun autre texte.

SOURCE :
{source_text}
"""

    raw = run_llm(prompt)

    return parse_angles_text(raw)


def parse_angles_text(text: str) -> List[Dict[str, str]]:
    """
    Parse une sortie IA réelle (tolérante aux variations).
    """
    if not isinstance(text, str):
        return []

    angles = []

    # Découpage large : puces, ANGLE, tirets
    blocks = re.split(
        r"(?:\n\s*ANGLE\s+\d+|\n\s*[•🔹\-])",
        text,
        flags=re.IGNORECASE,
    )

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Titre (plusieurs variantes possibles)
        title_match = re.search(
            r"(?:Titre\s*(?:provisoire)?\s*:)(.+)",
            block,
            flags=re.IGNORECASE,
        )

        # Signal (plusieurs variantes possibles)
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
