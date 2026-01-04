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
    Transforme une source brute en brouillon éditorial structuré.

    CONTRAT ÉDITORIAL STRICT :
    - title        : titre éditorial clair, non commercial, éclairant le contenu
    - excerpt      : synthèse courte (1–2 phrases) reprenant l'idée principale
    - content_html : structuration en 3 idées principales max
                     (sous-titre + 2–4 phrases par idée)
                     citations exactes autorisées si présentes dans la source
    - outro        : conclusion courte reformulant l’idée centrale
                     sans ajouter d’information nouvelle
    """

    topics = ", ".join(context.get("topics", []))
    companies = ", ".join(context.get("companies", []))
    persons = ", ".join(
        [f"{p['name']} ({p.get('role','')})" for p in context.get("persons", [])]
    )

    prompt = f"""
Tu es un assistant éditorial professionnel spécialisé en contenus B2B.
Tu n'es ni un marketeur, ni un rédacteur SEO, ni un copywriter.

Ta mission est de STRUCTURER une SOURCE BRUTE
en un BROUILLON ÉDITORIAL clair et exploitable.

================= CONTEXTE =================
Auteur : {author}
Topics : {topics or "—"}
Sociétés : {companies or "—"}
Personnes citées : {persons or "—"}

================= SOURCE =================
Type : {source_type}
Texte :
{source_text}

================= RÈGLES FONDAMENTALES =================
- Tu dois STRICTEMENT t'appuyer sur la source fournie.
- Tu as le DROIT de reformuler, résumer et structurer la source.
- Tu ne dois JAMAIS ajouter de faits ou d'informations absents de la source.
- Tu ne dois JAMAIS extrapoler au-delà de ce qui est explicitement exprimé.
- Si la source est courte ou abstraite, fais au mieux sans inventer.
- Ton : journalistique B2B, clair, neutre, informatif.
- Langue : français.
- Aucun emoji.
- Aucun ton promotionnel ou commercial.
- Aucun ton LinkedIn.
- HTML simple et valide uniquement (<p>, <h3>, <ul>, <li>, <strong>).

================= CONTRAT ÉDITORIAL (OBLIGATOIRE) =================

1. TITLE
- Titre éditorial accrocheur mais non commercial.
- Doit éclairer immédiatement le sujet traité.
- Doit être cohérent avec le contenu réel.

2. EXCERPT
- Synthèse courte (1 à 2 phrases).
- Reprend l’idée principale exprimée dans la source.
- Sert de point d’entrée éditorial.

3. CONTENT_HTML
- Structurer le contenu autour de 2 à 3 idées principales maximum.
- Pour chaque idée :
  - Un sous-titre clair (<h3>)
  - 2 à 4 phrases explicatives maximum.
- Si des citations existent dans la source :
  - Elles doivent être reprises MOT POUR MOT.
  - Ne jamais paraphraser une citation.
- Ne pas rallonger artificiellement le texte.

4. OUTRO
- Conclusion courte.
- Reformule l’idée principale déjà évoquée dans l’excerpt.
- Ne doit introduire AUCUNE information nouvelle.

================= FORMAT DE SORTIE (JSON STRICT) =================
Retourne UNIQUEMENT un JSON valide, sans texte autour.
Tous les champs DOIVENT être remplis (même brièvement).

{{
  "title": "Titre éditorial clair",
  "excerpt": "Synthèse courte de l’idée principale.",
  "content_html": "<h3>Idée principale 1</h3><p>Explication...</p><h3>Idée principale 2</h3><p>Explication...</p>",
  "outro": "Conclusion reformulant l’idée centrale."
}}
"""

    raw = run_llm(prompt)

    parsed = safe_extract_json(raw)

    # ---------------------------------------------------------
    # FALLBACK SI IA TROP PRUDENTE (SOURCE COURTE / ABSTRAITE)
    # ---------------------------------------------------------
    if not parsed or all(
        not parsed.get(k, "").strip()
        for k in ["title", "excerpt", "content_html", "outro"]
    ):
        source_clean = source_text.strip()

        return {
            "title": source_clean.split("\n")[0][:120],
            "excerpt": source_clean[:200],
            "content_html": f"<p>{source_clean}</p>",
            "outro": "Ce qu’il faut retenir : " + source_clean[:150],
        }

    return {
        "title": parsed.get("title", "").strip(),
        "excerpt": parsed.get("excerpt", "").strip(),
        "content_html": parsed.get("content_html", "").strip(),
        "outro": parsed.get("outro", "").strip(),
    }
