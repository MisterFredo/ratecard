import re
from typing import Dict, Any, Optional
from utils.llm import run_llm


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
    """

    if not isinstance(source_text, str) or not source_text.strip():
        raise ValueError("Source vide")

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
(Liste des notions structurantes ou "Aucun")
"""

    raw = run_llm(prompt)

    if not raw:
        raise ValueError("Réponse LLM vide")

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

    def parse_list(block: str):

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

    # transforme la liste en HTML simple
    if body:
        lines = parse_list(body)

        if lines:
            body = "<ul>" + "".join(
                f"<li>{l}</li>" for l in lines
            ) + "</ul>"

    return {
        "title": sections["TITLE"].strip(),
        "excerpt": sections["EXCERPT"].strip(),
        "content_body": body,
        "citations": parse_list(sections["CITATIONS"]),
        "chiffres": parse_list(sections["CHIFFRES"]),
        "acteurs_cites": parse_list(sections["ACTEURS"]),
        "concepts": parse_list(sections["CONCEPTS"]),
    }
