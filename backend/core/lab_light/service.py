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
Tu es un assistant éditorial professionnel spécialisé en contenus B2B.

Ta mission est de transformer une SOURCE BRUTE en un ARTICLE ÉDITORIAL
clair, structuré et publiable.

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
- Tu dois STRICTEMENT t'appuyer sur la source fournie.
- Tu ne dois JAMAIS inventer d'information.
- Tu ne dois JAMAIS extrapoler au-delà de la source.
- Style journalistique B2B, clair et professionnel.
- Langue : français.
- HTML valide (<p>, <ul>, <li>, <strong>, <h2> si pertinent).
- Aucun emoji.
- Aucun ton LinkedIn.

================= CONTRAINTE CRITIQUE =================
Tu DOIS remplir TOUS les champs ci-dessous avec du CONTENU RÉEL.
AUCUN champ ne doit être vide.

================= FORMAT DE SORTIE (JSON STRICT) =================
Retourne UNIQUEMENT un JSON valide, sans texte autour.

{
  "title": "Titre clair et informatif de l’article",
  "excerpt": "Accroche courte résumant l’enjeu principal.",
  "content_html": "<p>Contenu HTML structuré avec plusieurs paragraphes.</p>",
  "outro": "Synthèse finale : ce qu’il faut retenir."
}
"""

    raw = run_llm(prompt)

    # ⚠️ Si run_llm a renvoyé une erreur JSON
    if raw.strip().startswith("{") and '"error"' in raw:
        try:
            return json.loads(raw)
        except Exception:
            return {
                "error": "llm_error",
                "raw": raw
            }

    parsed = safe_extract_json(raw)

    if not parsed:
        return {
            "error": "invalid_json",
            "raw": raw
        }

    return {
        "title": parsed.get("title", "").strip(),
        "excerpt": parsed.get("excerpt", "").strip(),
        "content_html": parsed.get("content_html", "").strip(),
        "outro": parsed.get("outro", "").strip(),
    }
