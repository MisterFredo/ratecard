from typing import List, Dict
from utils.llm import run_llm
from core.lab_content.utils import safe_extract_json


def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
) -> List[Dict[str, str]]:
    """
    Propose 1 à 3 angles mono-signal.
    """

    prompt = f"""
Tu es un agent éditorial Ratecard.

À partir de la source ci-dessous, propose entre 1 et 3 ANGLES mono-signal.

================= SOURCE =================
Type : {source_type}
Texte :
{source_text}

================= RÈGLES =================
- Aucun texte rédigé.
- Aucun commentaire.
- Angles distincts.
- Français.

================= FORMAT =================
{{
  "angles": [
    {{
      "angle_title": "...",
      "angle_signal": "..."
    }}
  ]
}}
"""

    raw = run_llm(prompt)
    parsed = safe_extract_json(raw)

    return parsed.get("angles", [])
