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
    """
    Normalise un header :
    - supprime accents
    - supprime #
    - supprime :
    - uppercase
    - trim
    """
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
    # PROMPT (STRICTEMENT IDENTIQUE)
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
(Titre factuel.)

EXCERPT
(1 à 2 phrases synthétiques.)

POINTS CLES
(Liste factuelle. Les points clés doivent être séparés par des retours à la ligne.)

CITATIONS
(Liste exacte ou "Aucun")

CHIFFRES
(Liste exacte ou "Aucun")

ACTEURS
(Liste des entreprises citées ou "Aucun")

CONCEPTS
(Liste des notions métier identifiées dans la source.
Chaque concept doit être suivi de son topic entre parenthèses sous la forme exacte :
"Nom du concept (Topic: Nom exact du topic)"
Le topic doit obligatoirement être choisi parmi la liste autorisée.
Si aucun concept pertinent, écrire "Aucun")

SOLUTIONS
(Noms de produits, plateformes ou offres.
Ou "Aucun")

TOPICS
(Choisir 1 à 3 topics uniquement parmi cette liste.
Ne jamais inventer ni reformuler.)

{topics_list_text}

================ ANALYSE STRATEGIQUE ================

MECANIQUE
(Explique en 3 à 6 lignes la mécanique business ou opérationnelle décrite dans la source.
Strictement basée sur le texte.)

ENJEU
(Quel est l’enjeu stratégique sous-jacent ? 2 à 4 lignes.)

FRICTION
(Quel point de tension, limite ou incertitude apparaît ? 1 à 3 lignes.
Si aucun, écrire "Aucun")

SIGNAL
(Quel signal de marché cela révèle-t-il ? 2 à 4 lignes.)
"""

    raw = run_llm(prompt)

    if not raw:
        raise ValueError("Réponse LLM vide")

    # ============================================================
    # PARSING ROBUSTE (SEULE PARTIE MODIFIÉE)
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

        # Header detection plus tolérant
        matched = False
        for key in sections.keys():
            if normalized.startswith(key):
                current = key
                matched = True
                break

        if matched:
            continue

        if current:
            sections[current] += clean + "\n"

    # ============================================================
    # LIST PARSER ROBUSTE
    # ============================================================

    def parse_list(block: str) -> List[str]:

        if not block:
            return []

        if block.strip().lower().startswith("aucun"):
            return []

        items = []

        for line in block.splitlines():

            line = line.strip()

            # enlève bullets
            line = re.sub(r"^[-•]\s*", "", line)

            # enlève numérotation 1. 2.
            line = re.sub(r"^\d+\.\s*", "", line)

            if line and line.lower() != "aucun":
                items.append(line)

        return items

    # ============================================================
    # CONCEPTS PARSER ROBUSTE MAIS STRICT
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
            line = re.sub(r"^\d+\.\s*", "", line)

            if not line:
                continue

            match = re.match(
                r"(.+?)\s*\(\s*Topic\s*:\s*(.+?)\s*\)",
                line,
                re.IGNORECASE,
            )

            if not match:
                continue

            label = match.group(1).strip()
            topic_label_raw = match.group(2).strip()

            # mapping strict insensible à la casse
            topic_label = next(
                (k for k in allowed_topics.keys()
                 if k.lower() == topic_label_raw.lower()),
                None
            )

            if topic_label:
                results.append({
                    "label": label,
                    "topic_id": allowed_topics[topic_label],
                })

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
    # TOPICS MAPPING STRICT MAIS CASE-INSENSITIVE
    # ============================================================

    raw_topics = parse_list(sections["TOPICS"])

    valid_topics = []

    for t in raw_topics:
        match = next(
            (k for k in allowed_topics.keys()
             if k.lower() == t.lower()),
            None
        )
        if match:
            valid_topics.append(match)

    topic_ids = [
        allowed_topics[t] for t in valid_topics
    ]

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
