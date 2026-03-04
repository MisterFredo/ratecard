import re
from typing import Dict, Any, List
from utils.llm import run_llm


# ============================================================
# IA SUMMARY — SOURCE → FACTUAL SYNTHESIS
# ============================================================
def transform_source_to_content(
    source_type: str,
    source_text: str,
    context: Dict[str, Any],
    available_concepts: List[Dict[str, str]],
) -> Dict[str, Any]:

    if not isinstance(source_text, str) or not source_text.strip():
        return {}

    # ---------------------------------------------------------
    # BUILD CONCEPT LIST FOR PROMPT
    # ---------------------------------------------------------
    concepts_block = "\n".join(
        [f"- {c['title']}" for c in available_concepts]
    ) if available_concepts else "Aucun concept disponible"

    prompt = f"""
Tu es un assistant de synthèse professionnelle B2B.

MISSION :
Produire une synthèse factuelle, dense et précise.

OBJECTIF :
Permettre à un professionnel de comprendre en moins de 30 secondes :
- Ce qui est annoncé
- Ce qui change
- Les idées structurantes
- Les éléments concrets présentés

⚠️ RÈGLES ABSOLUES :
- Strictement basé sur la source.
- Aucun fait inventé.
- Aucun chiffre inventé.
- Aucun acteur inventé.
- Aucune interprétation.
- Aucune analyse externe.
- Pas de reformulation marketing.
- Style sobre, professionnel, informatif.

==================== SOURCE ====================
Type : {source_type}
Texte :
{source_text}

==================== CONCEPTS AUTORISÉS ====================
Après avoir rédigé la synthèse,
tu peux sélectionner zéro, un ou plusieurs concepts pertinents
UNIQUEMENT parmi la liste suivante.
Ne jamais inventer.

{concepts_block}

==================== FORMAT STRICT ====================

TITLE
(Titre factuel et clair.)

EXCERPT
(1 à 2 phrases synthétiques expliquant l'essentiel.)

POINTS CLES
(Liste factuelle des éléments importants à retenir.)

CITATIONS
(Liste exacte ou "Aucun")

CHIFFRES
(Liste exacte ou "Aucun")

ACTEURS
(Liste entreprises mentionnées ou "Aucun")

CONCEPTS
(Liste exacte ou "Aucun")
"""

    raw = run_llm(prompt)

    sections = {
        "TITLE": "",
        "EXCERPT": "",
        "POINTS CLES": "",
        "CITATIONS": "",
        "CHIFFRES": "",
        "ACTEURS": "",
        "CONCEPTS": "",
    }

    current = None

    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue

        header = line.upper()

        if header in sections:
            current = header
            continue

        if current:
            sections[current] += line + "\n"

    title = sections["TITLE"].strip()
    excerpt = sections["EXCERPT"].strip()
    points_cles = sections["POINTS CLES"].strip()

    # ---------------------------------------------------------
    # PARSE LIST BLOCKS
    # ---------------------------------------------------------
    def parse_list(block: str):
        if not block or block.lower().startswith("aucun"):
            return []
        items = []
        for line in block.splitlines():
            line = re.sub(r"^[-•]\s*", "", line.strip())
            if line:
                items.append(line)
        return items

    citations = parse_list(sections["CITATIONS"])
    chiffres = parse_list(sections["CHIFFRES"])
    acteurs = parse_list(sections["ACTEURS"])
    concept_titles = parse_list(sections["CONCEPTS"])

    # ---------------------------------------------------------
    # BACKEND VALIDATION DES CONCEPTS
    # ---------------------------------------------------------
    valid_map = {c["title"]: c["id"] for c in available_concepts}
    selected_concepts = []

    for title_candidate in concept_titles:
        if title_candidate in valid_map:
            selected_concepts.append({
                "id": valid_map[title_candidate],
                "title": title_candidate,
            })

    return {
        "title": title,
        "excerpt": excerpt,
        "content_body": points_cles,
        "citations": citations,
        "chiffres": chiffres,
        "acteurs_cites": acteurs,
        "concepts": selected_concepts,
    }
