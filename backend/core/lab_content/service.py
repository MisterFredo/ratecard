import json
import re
from typing import Dict, Any
from utils.llm import run_llm


# ============================================================
# JSON SAFE EXTRACTION
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
# NORMALISATION SORTIE IA CONTENT
# ============================================================
def normalize_content_output(parsed: Dict[str, Any]) -> Dict[str, str]:
    """
    Normalise les différentes formes possibles de sortie LLM
    vers le contrat Content attendu.
    """

    # Cas 1 — format strict attendu
    if all(k in parsed for k in ["excerpt", "concept", "content_body"]):
        return {
            "excerpt": parsed.get("excerpt", ""),
            "concept": parsed.get("concept", ""),
            "content_body": parsed.get("content_body", ""),
        }

    # Cas 2 — contenu imbriqué
    for key in ["content", "result", "data"]:
        if isinstance(parsed.get(key), dict):
            inner = parsed[key]
            if all(k in inner for k in ["excerpt", "concept", "content_body"]):
                return {
                    "excerpt": inner.get("excerpt", ""),
                    "concept": inner.get("concept", ""),
                    "content_body": inner.get("content_body", ""),
                }

    # Cas 3 — noms alternatifs (rare mais réel)
    excerpt = parsed.get("excerpt") or parsed.get("summary")
    concept = parsed.get("concept") or parsed.get("idea")
    body = (
        parsed.get("content_body")
        or parsed.get("body")
        or parsed.get("content")
        or ""
    )

    if excerpt or concept or body:
        return {
            "excerpt": excerpt or "",
            "concept": concept or "",
            "content_body": body or "",
        }

    # Fallback vide
    return {
        "excerpt": "",
        "concept": "",
        "content_body": "",
    }


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

    CONTRAT FINAL :
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
    normalized = normalize_content_output(parsed)

    # ---------------------------------------------------------
    # FALLBACK MÉTIER (source courte / réponse vide)
    # ---------------------------------------------------------
    if not any(normalized.values()):
        clean = source_text.strip()
        return {
            "excerpt": angle_signal,
            "concept": angle_signal,
            "content_body": clean[:800],
        }

    return {
        "excerpt": normalized["excerpt"].strip(),
        "concept": normalized["concept"].strip(),
        "content_body": normalized["content_body"].strip(),
    }
