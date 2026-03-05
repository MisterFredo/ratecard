import re
from typing import Dict, Any, Optional, List
from utils.llm import run_llm
from utils.bigquery_utils import query_bq


# ============================================================
# GENERATE SUMMARY FROM SOURCE
# ============================================================
def generate_summary(
    source_id: Optional[str],
    source_text: str,
) -> Dict[str, Any]:
    """
    Génère une structure éditoriale à partir d'une source brute.

    Retourne :
    - title
    - excerpt
    - content_body
    - citations
    - chiffres
    - acteurs_cites
    - concepts
    - solutions
    - topics (ID_TOPIC)
    """

    if not isinstance(source_text, str) or not source_text.strip():
        raise ValueError("Source vide")

    # ============================================================
    # LOAD GOVERNED TOPICS
    # ============================================================

    topics_rows = query_bq("""
        SELECT ID_TOPIC, LABEL
        FROM `adex-5555.RATECARD.RATECARD_TOPIC`
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
- Style professionnel et synthétique.
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
(Liste factuelle.)

CITATIONS
(Liste exacte ou "Aucun")

CHIFFRES
(Liste exacte ou "Aucun")

ACTEURS
(Liste des entreprises citées ou "Aucun")

CONCEPTS
(Notions métier, frameworks, dynamiques marché.
Ne pas inclure de nom de produit ou de société.
Ou "Aucun")

SOLUTIONS
(Noms de produits, plateformes, offres commerciales spécifiques.
Ou "Aucun")

TOPICS
(Choisir 1 à 3 topics uniquement parmi cette liste.
Ne jamais inventer ni reformuler.)

{topics_list_text}
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
        "CITATIONS": "",
        "CHIFFRES": "",
        "ACTEURS": "",
        "CONCEPTS": "",
        "SOLUTIONS": "",
        "TOPICS": "",
    }

    current = None

    for line in raw.splitlines():

        clean = line.strip()
        if not clean:
            continue

        normalized = clean.upper().replace(":", "").strip()

        for key in sections:
            if normalized.startswith(key):
                current = key
                break
        else:
            if current:
                sections[current] += clean + "\n"

    def parse_list(block: str) -> List[str]:

        if not block:
            return []

        if block.lower().startswith("aucun"):
            return []

        items = []

        for line in block.splitlines():

            line = line.strip()
            line = re.sub(r"^[-•]\s*", "", line)

            if line and line.lower() != "aucun":
                items.append(line)

        return items

    # ============================================================
    # CLEAN BODY
    # ============================================================

    body = sections["POINTS CLES"].strip()

    if body:
        lines = parse_list(body)
        if lines:
            body = "<ul>" + "".join(
                f"<li>{l}</li>" for l in lines
            ) + "</ul>"

    # ============================================================
    # VALIDATE & MAP TOPICS
    # ============================================================

    raw_topics = parse_list(sections["TOPICS"])

    valid_topics = [
        t for t in raw_topics
        if t in allowed_topics
    ]

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
        "concepts": parse_list(sections["CONCEPTS"]),
        "solutions": parse_list(sections["SOLUTIONS"]),
        "topics": topic_ids,
    }
