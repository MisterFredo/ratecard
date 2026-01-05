import json
import re
from typing import Dict, Any
from utils.llm import run_llm


# ============================================================
# JSON SAFE EXTRACTION (copié depuis lab_light)
# ============================================================
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


# ============================================================
# IA CONTENT — SOURCE → CONTENT
# ============================================================
def transform_source_to_content(
    source_type: str,
    source_text: str,
    angle_title: str,
    angle_signal: str,
    context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Transforme une source en CONTENT Ratecard structuré.

    CONTRAT :
    - excerpt
    - concept
    - content_body
    """

    topics = ", ".join(context.get("topics", []))
    events = ", ".join(context.get("events", []))
    companies = ", ".join(context.get("companies", []))
    persons = ", ".join(context.get("persons", []))

    prompt = f"""
Tu es un rédacteur analytique Ratecard.

Ta mission est de produire un CONTENU STRUCTURÉ
à partir d’une SOURCE et d’un ANGLE validé.

================= CONTEXTE =================
Topics : {topics or "—"}
Events : {events or "—"}
Sociétés : {companies or "—"}
Personnes : {persons or "—"}

================= ANGLE =================
Titre : {angle_title}
Signal : {angle_signal}

================= SOURCE =================
Type : {source_type}
Texte :
{source_text}

================= RÈGLES =================
- STRICTEMENT basé sur la source.
- Reformuler autorisé, invention interdite.
- Mono-signal (respect strict de l’angle).
- Ton analytique, neutre, B2B.
- Français.
- Aucun CTA.
- Aucun ton marketing.

================= FORMAT DE SORTIE (JSON STRICT) =================
{{
  "excerpt": "Accroche courte (1–2 phrases)",
  "concept": "Phrase unique résumant l’enjeu central",
  "content_body": "Développement dense, structuré, exploitable"
}}
"""

    raw = run_llm(prompt)
    parsed = safe_extract_json(raw)

    # ---------------------------------------------------------
    # FALLBACK (SOURCE COURTE / ABSTRAITE)
    # ---------------------------------------------------------
    if not parsed or all(
        not parsed.get(k, "").strip()
        for k in ["excerpt", "concept", "content_body"]
    ):
        clean = source_text.strip()
        return {
            "excerpt": angle_signal,
            "concept": angle_signal,
            "content_body": clean[:800],
        }

    return {
        "excerpt": parsed.get("excerpt", "").strip(),
        "concept": parsed.get("concept", "").strip(),
        "content_body": parsed.get("content_body", "").strip(),
    }

