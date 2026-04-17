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
- Toute analyse doit être déduite des éléments présents dans la source.
- Ne pas extrapoler au-delà de ce qui est implicitement ou explicitement contenu dans le texte.
- Ne jamais formuler de recommandation.
- Ne jamais dire ce qu’il faut faire.
- Style professionnel, clair, structuré et synthétique.
- Rédige toujours en français.

OBJECTIF :
Produire une analyse structurée permettant de comprendre :
- ce qui se passe
- comment cela fonctionne
- quelles dynamiques sont à l’œuvre

================ SOURCE ================
Source : {source_id or "inconnue"}

{source_text}

================ FORMAT OBLIGATOIRE ================

TITLE
(Titre factuel et informatif.)

EXCERPT
(3 phrases synthétiques permettant de comprendre rapidement le sujet et son intérêt.)

POINTS CLES
(Liste factuelle des éléments importants présents dans la source.
Exhaustif mais strictement basé sur le texte.
Une ligne = une information.)

CHIFFRES
Extraire uniquement les chiffres structurés présents dans la source.

Chaque ligne doit respecter STRICTEMENT ce format :
label | valeur | unité | acteur | marché | période

ACTEURS
(Liste des entreprises citées ou "Aucun")

CONCEPTS
(Liste des notions métier identifiées dans la source.
Chaque concept doit être associé à un topic existant.)

SOLUTIONS
(Noms de produits, plateformes ou offres ou "Aucun")

TOPICS
(Choisir 1 à 3 topics uniquement parmi la liste suivante.
Ne jamais inventer.)

{topics_list_text}

================ ANALYSE STRATEGIQUE ================

MECANIQUE
- Expliquer COMMENT cela fonctionne réellement

ENJEU
- Identifier ce que cela révèle

FRICTION
- Identifier les limites ou écrire "Aucun"

SIGNAL
- Identifier la dynamique de marché
"""

    raw = run_llm(prompt)

    if not raw:
        raise ValueError("Réponse LLM vide")

    # ============================================================
    # PARSING
    # ============================================================

    sections = {
        "TITLE": "",
        "EXCERPT": "",
        "POINTS CLES": "",
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
            line = re.sub(r"^\d+\.\s*", "", line)

            if line and line.lower() != "aucun":
                items.append(line)

        return items

    # ============================================================
    # CONCEPTS PARSER
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
    # TOPICS
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
    # RETURN
    # ============================================================

    return {
        "title": sections["TITLE"].strip(),
        "excerpt": sections["EXCERPT"].strip(),
        "content_body": body,
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
