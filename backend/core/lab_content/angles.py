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
    Sortie TEXT, pas JSON.
    """

    prompt = f"""
Tu es un agent éditorial ADEX.

À partir de la source ci-dessous, propose entre 1 et 3 ANGLES mono-signal exploitables.

RÈGLES :
- Un angle = un seul sujet clair
- Chaque angle contient :
  - un Titre
  - un Signal (1 phrase)
- Aucun texte d’introduction ou de conclusion
- Pas de commentaire
- Français

FORMAT DE SORTIE ATTENDU :

ANGLE 1
Titre : ...
Signal : ...

ANGLE 2
Titre : ...
Signal : ...

ANGLE 3
Titre : ...
Signal : ...

SOURCE :
{source_text}
"""

    raw = run_llm(prompt)

    return parse_angles_text(raw)


def parse_angles_text(text: str) -> List[Dict[str, str]]:
    """
    Parse une sortie texte IA en liste d'angles.
    """
    if not isinstance(text, str):
        return []

    angles = []

    blocks = re.split(r"\bANGLE\s+\d+\b", text, flags=re.IGNORECASE)

    for block in blocks:
        title_match = re.search(r"Titre\s*:\s*(.+)", block)
        signal_match = re.search(r"Signal\s*:\s*(.+)", block)

        if title_match and signal_match:
            angles.append({
                "angle_title": title_match.group(1).strip(),
                "angle_signal": signal_match.group(1).strip(),
            })

    return angles
