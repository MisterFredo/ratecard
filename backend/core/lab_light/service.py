# backend/core/lab_light/service.py

import json
import re
from utils.llm import run_llm


def safe_extract_json(text: str) -> dict:
    """
    Tente d’extraire un JSON même si le modèle a ajouté du texte autour.
    - Détecte la première accolade ouvrante et la dernière fermante
    - Corrige des erreurs simples (guillemets, virgules finales)
    - Retourne {} si impossible
    """
    if not isinstance(text, str):
        return {}

    # Cherche un bloc JSON dans le texte
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return {}

    json_text = match.group(0).strip()

    # Tentative stricte
    try:
        return json.loads(json_text)
    except Exception:
        pass

    # Correction de quotes potential
    json_text = json_text.replace("“", '"').replace("”", '"')
    json_text = json_text.replace("‘", "'").replace("’", "'")

    # Virer virgules finales
    json_text = re.sub(r",\s*}", "}", json_text)
    json_text = re.sub(r",\s*\]", "]", json_text)

    try:
        return json.loads(json_text)
    except Exception:
        return {}


def transform_source(source_type: str, source_text: str, author: str) -> dict:
    """
    Transforme une source brute en ARTICLE_DRAFT Ratecard.
    Retourne TOUJOURS un objet propre (jamais une exception).
    """

    prompt = f"""
Tu es un assistant éditorial professionnel chargé de transformer une SOURCE BRUTE 
en un ARTICLE DRAFT clair, structuré et publiable sur Ratecard.fr.

================== RÈGLES ÉDITORIALES (RÉSUMÉ) ==================
- Style journalistique B2B, ton professionnel, clair.
- Aucune invention, aucune extrapolation externe.
- Pas de style LinkedIn, pas d'emoji.
- Structure HTML strictement conforme.

================== FORMAT JSON À RETOURNER ==================
{{
  "title_proposal": "",
  "excerpt": "",
  "content_html": "",
  "angle": "",
  "suggested_topics": [],
  "suggested_companies": [],
  "suggested_products": [],
  "notes": ""
}}

================== SOURCE ==================
TYPE : {source_type}
AUTEUR : {author}

TEXTE :
{source_text}
"""

    # ----------------------------------------------------
    # APPEL LLM — AVEC CATCH D'ERREUR
    # ----------------------------------------------------
    try:
        raw = run_llm(prompt)
    except Exception as e:
        return {
            "error": "llm_error",
            "message": f"Erreur appel OpenAI: {e}",
            "draft": None,
        }

    if not raw or not isinstance(raw, str):
        return {
            "error": "empty_llm_response",
            "raw": raw,
            "message": "Le modèle n'a renvoyé aucun texte.",
        }

    # ----------------------------------------------------
    # PARSING JSON ROBUSTE
    # ----------------------------------------------------
    parsed = safe_extract_json(raw)

    if parsed:
        return parsed

    # ----------------------------------------------------
    # ÉCHEC TOTAL → retour safe
    # ----------------------------------------------------
    return {
        "error": "invalid_json",
        "raw": raw,
        "message": "Impossible de parser un JSON valide.",
        "fallback": {
            "title_proposal": "",
            "excerpt": "",
            "content_html": "",
            "angle": "",
            "suggested_topics": [],
            "suggested_companies": [],
            "suggested_products": [],
            "notes": ""
        }
    }

