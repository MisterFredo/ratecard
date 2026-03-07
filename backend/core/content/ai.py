import re
import unicodedata
from typing import Dict, Any, Optional, List

from config import BQ_PROJECT, BQ_DATASET
from utils.llm import run_llm
from utils.bigquery_utils import query_bq


# ============================================================
# UTILS — NORMALISATION HEADER
# ============================================================

def normalize_key(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = text.encode("ascii", "ignore").decode("utf-8")
    text = text.replace("#", "")
    text = text.replace(":", "")
    return text.strip().upper()


# ============================================================
# GENERATE SUMMARY + ANALYSE FROM SOURCE
# ============================================================

def generate_summary(
    source_id: Optional[str],
    source_text: str,
) -> Dict[str, Any]:

    if not isinstance(source_text, str) or not source_text.strip():
        raise ValueError("Source vide")

    # ============================================================
    # LOAD GOVERNED TOPICS
    # ============================================================

    topics_rows = query_bq(f"""
        SELECT ID_TOPIC, LABEL
        FROM `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC`
        WHERE IS_ACTIVE = TRUE
    """)

    allowed_topics = {
        row["LABEL"]: row["ID_TOPIC"]
        for row in topics_rows
    }

    topics_list_text = "\n".join(
        f"- {label}" for label in allowed_topics.keys()
    )

    # ============================================================
    # PROMPT
    # ============================================================

    prompt = f"""
Tu es un assistant éditorial B2B spécialisé marketing, AdTech et Retail Media.

RÈGLES ABSOLUES :
- Strictement basé sur la source fournie.
- Aucun fait inventé.
- Aucun chiffre inventé.
- Aucun acteur inventé.
- Toute analyse doit être strictement déduite du texte.
- Ne pas extrapoler au-delà des éléments explicitement mentionnés.
- Style professionnel, clair et structuré.
- Rédige toujours en français.

================ SOURCE ================
Source : {source_id or "inconnue"}

{source_text}

================ FORMAT OBLIGATOIRE ================

TITLE
EXCERPT
POINTS CLES
CITATIONS
CHIFFRES
ACTEURS
CONCEPTS
SOLUTIONS
TOPICS
MECANIQUE
ENJEU
FRICTION
SIGNAL

TOPICS autorisés :
{topics_list_text}
"""

    raw = run_llm(prompt)

    if not raw:
        raise ValueError("Réponse LLM vide")

    # ============================================================
    # PARSING ROBUSTE DES SECTIONS
    # ============================================================

    sections = {
        "TITLE": "",
        "EXCERPT": "",
        "POINTS CLES": "",
        "CITATIONS": "",
        "CHIFFRES": "",
        "ACTEURS": "",
        "CONCEPTS": "",
        "SOLUTIONS": "",
        "TOPICS": "",
        "MECANIQUE": "",
        "ENJEU": "",
        "FRICTION": "",
        "SIGNAL": "",
    }

    current = None

    for line in raw.splitlines():

        clean = line.strip()
        if not clean:
            continue

        normalized = normalize_key(clean)

        matched = None
        for key in sections.keys():
            if normalized.startswith(key):
                matched = key
                break

        if matched:
            current = matched
            continue

        if current:
            sections[current] += clean + "\n"

    # ============================================================
    # LIST PARSER
    # ============================================================

    def parse_list(block: str) -> List[str]:

        if not block:
            return []

        if block.strip().lower().startswith("aucun"):
            return []

        items = []

        for line in block.splitlines():
            line = line.strip()
            line = re.sub(r"^[-•]\s*", "", line)
            if line and line.lower() != "aucun":
                items.append(line)

        return items

    # ============================================================
    # CONCEPTS PARSER STRICT MAIS ROBUSTE
    # ============================================================

    def parse_concepts(block: str) -> List[Dict[str, str]]:

        if not block:
            return []

        if block.strip().lower().startswith("aucun"):
            return []

        results = []

        for line in block.splitlines():

            line = line.strip()
            line = re.sub(r"^[-•]\s*", "", line)

            if not line:
                continue

            match = re.search(
                r"(.+?)\s*\(\s*topic\s*:\s*(.+?)\s*\)",
                line,
                re.IGNORECASE
            )

            if not match:
                continue

            label = match.group(1).strip()
            topic_label = match.group(2).strip()

            for allowed_label, topic_id in allowed_topics.items():
                if topic_label.lower() == allowed_label.lower():
                    results.append({
                        "label": label,
                        "topic_id": topic_id,
                    })
                    break

        return results

    # ============================================================
    # CLEAN BODY
    # ============================================================

    body = sections["POINTS CLES"].strip()

    if body:
        lines = parse_list(body)
        if lines:
            body = "<ul>" + "".join(f"<li>{l}</li>" for l in lines) + "</ul>"

    # ============================================================
    # TOPICS MAPPING STRICT
    # ============================================================

    raw_topics = parse_list(sections["TOPICS"])

    topic_ids = []

    for t in raw_topics:
        for allowed_label, topic_id in allowed_topics.items():
            if t.strip().lower() == allowed_label.strip().lower():
                topic_ids.append(topic_id)
                break

    # ============================================================
    # RETURN STRUCTURED DATA
    # ============================================================

    return {
        "title": sections["TITLE"].strip(),
        "excerpt": sections["EXCERPT"].strip(),
        "content_body": body,
        "citations": parse_list(sections["CITATIONS"]),
        "chiffres": parse_list(sections["CHIFFRES"]),
        "acteurs_cites": parse_list(sections["ACTEURS"]),
        "concepts": parse_concepts(sections["CONCEPTS"]),
        "solutions": parse_list(sections["SOLUTIONS"]),
        "topics": topic_ids,
        "mecanique_expliquee": sections["MECANIQUE"].strip(),
        "enjeu_strategique": sections["ENJEU"].strip(),
        "point_de_friction": sections["FRICTION"].strip(),
        "signal_analytique": sections["SIGNAL"].strip(),
    }
