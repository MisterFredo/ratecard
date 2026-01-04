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
- Le contenu principal doit être du HTML valide (<p>, <ul>, <li>, <strong>, <h2> si pertinent).
- Aucun emoji.
- Aucun ton LinkedIn.
- Aucune phrase du type "cet article explore" ou "nous verrons que".

================= CONTRAINTE CRITIQUE =================
Tu DOIS remplir TOUS les champs ci-dessous avec du CONTENU RÉEL.
AUCUN champ ne doit être vide.
Si la source est courte, fais au mieux, mais remplis tous les champs.

================= FORMAT DE SORTIE (JSON STRICT) =================
Retourne UNIQUEMENT un JSON valide, sans texte autour.

{
  "title": "Titre clair et informatif de l’article",
  "excerpt": "Accroche courte résumant l’enjeu principal en 1 à 2 phrases.",
  "content_html": "<p>Contenu HTML structuré avec plusieurs paragraphes.</p>",
  "outro": "Synthèse finale : ce qu’il faut retenir."
}
"""

    try:
        raw = run_llm(prompt)
    except Exception as e:
        return {
            "error": "llm_error",
            "message": str(e),
        }

    # 🔍 DEBUG TEMPORAIRE (à laisser le temps des tests)
    # print("RAW LLM RESPONSE:", raw)

    parsed = safe_extract_json(raw)

    # Validation stricte du contrat
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

