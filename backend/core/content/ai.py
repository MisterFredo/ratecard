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
    # PROMPT (AMÉLIORÉ)
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

L’objectif est d’expliciter les logiques sous-jacentes, pas de prendre des décisions à la place du lecteur.

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

CITATIONS
(Liste exacte ou "Aucun")

CHIFFRES
Extraire uniquement les chiffres structurés présents dans la source.

Chaque ligne doit respecter STRICTEMENT ce format :
label | valeur | unité | acteur | marché | période

Règles :

- Une ligne = un seul chiffre
- Ne JAMAIS concaténer plusieurs chiffres
- Ne JAMAIS ajouter de texte autour
- Le séparateur doit être exactement : " | "

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
- Décrire la logique business, opérationnelle ou de marché
- Ne pas reformuler le texte
- Mettre en évidence les relations (offre, demande, comportement, structure)

ENJEU
- Identifier ce que cela révèle comme logique ou tension
- Répondre implicitement à : "qu’est-ce que cela change dans la manière de penser ce sujet"
- Ne pas donner de recommandation

FRICTION
- Identifier les limites, tensions ou incertitudes présentes dans la source
- Si aucune, écrire "Aucun"

SIGNAL
- Identifier la dynamique de marché sous-jacente
- Aller au-delà des faits sans inventer
- Mettre en évidence une transformation, un déplacement ou une tendance
- Ne pas répéter le contenu
- Ne pas être descriptif
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
