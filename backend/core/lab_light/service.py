import json
import re
from typing import Dict, Any
from utils.llm import run_llm


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

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return {}

    json_text = match.group(0)

    try:
        return json.loads(json_text)
    except Exception:
        pass

    # Nettoyages légers
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


# ---------------------------------------------------------
# IA CONTENU — SOURCE → ARTICLE
# ---------------------------------------------------------
def transform_source(
    source_type: str,
    source_text: str,
    author: str,
    context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Transforme une source brute en brouillon d'article éditorial.

    Retourne STRICTEMENT :
    - title
    - excerpt
    - content_html
    - outro
    """

    topics = ", ".join(context.get("topics", []))
    companies = ", ".join(context.get("companies", []))
    persons = ", ".join(
        [f"{p['name']} ({p.get('role','')})" for p in context.get("persons", [])]
    )

    prompt = f"""
Tu es un assistant éditorial professionnel.
Tu dois transformer une SOURCE BRUTE en ARTICLE ÉDITORIAL B2B.

================= CONTEXTE =================
Auteur : {author}
Topics : {topics or "—"}
Sociétés : {companies or "—"}
Personnes citées : {persons or "—"}

================= SOURCE =================
Type : {source_type}
Texte :
{source_text}

================= RÈGLES ABSOLUES =================
- Ne jamais inventer d'information.
- Ne jamais extrapoler hors de la source.
- Ton professionnel, journalistique.
- Langue : français.
- HTML valide pour le contenu.
- Pas de style LinkedIn.
- Pas d'emojis.

================= FORMAT DE SORTIE (JSON STRICT) =================
{{
  "title": "",
  "excerpt": "",
  "content_html": "",
  "outro": ""
}}
"""

    try:
        raw = run_llm(prompt)
    except Exception as e:
        return {
            "error": "llm_error",
            "message": str(e),
        }

    parsed = safe_extract_json(raw)

    # Validation minimale du contrat
    if not parsed:
        return {
            "error": "invalid_json",
            "raw": raw,
        }

    return {
        "title": parsed.get("title", "").strip(),
        "excerpt": parsed.get("excerpt", "").strip(),
        "content_html": parsed.get("content_html", "").strip(),
        "outro": parsed.get("outro", "").strip(),
    }
