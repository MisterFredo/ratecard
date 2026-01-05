import json
import re
from typing import List, Dict, Any
from utils.llm import run_llm


def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
) -> List[Dict[str, str]]:
    """
    Propose 1 à 3 angles mono-signal exploitables.
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

    # ---------------------------------------------------------
    # NORMALISATION ROBUSTE DE LA SORTIE LLM
    # ---------------------------------------------------------

    # Cas 1 — format attendu
    if isinstance(parsed, dict) and isinstance(parsed.get("angles"), list):
        return parsed["angles"]

    # Cas 2 — le LLM renvoie directement une liste
    if isinstance(parsed, list):
        return parsed

    # Cas 3 — autres clés fréquentes
    if isinstance(parsed, dict):
        for key in ["items", "results", "data"]:
            if isinstance(parsed.get(key), list):
                return parsed[key]

    # Fallback — aucun angle exploitable
    return []


# ---------------------------------------------------------
# JSON SAFE EXTRACTION
# ---------------------------------------------------------
def safe_extract_json(text: str) -> Dict[str, Any]:
    """
    Extrait un JSON valide depuis une réponse LLM bruitée.
    Retourne {} si échec.
    """
    if not isinstance(text, str):
        return {}

    # Extraction brute du premier bloc JSON
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return {}

    json_text = match.group(0)

    # Tentative directe
    try:
        return json.loads(json_text)
    except Exception:
        pass

    # Nettoyage des guillemets et virgules traînantes
    json_text = (
        json_text
        .replace("“", '"')
        .replace("”", '"')
        .replace("‘", "'")
        .replace("’", "'")
    )
    json_text = re.sub(r",\s*}", "}", json_text)
    json_text = re.sub(r",\s*]", "]", json_text)

    try:
        return json.loads(json_text)
    except Exception:
        return {}
