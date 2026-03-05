import re
from typing import Dict, Any
from utils.llm import run_llm


# ============================================================
# IA SUMMARY — SOURCE → FACTUAL SYNTHESIS
# ============================================================
def transform_source_to_content(
    source_type: str,
    source_text: str,
    context: Dict[str, Any],
) -> Dict[str, Any]:

    if not isinstance(source_text, str) or not source_text.strip():
        return {}

    prompt = f"""
Tu es un assistant de synthèse professionnelle B2B.

MISSION :
Produire une synthèse factuelle, dense et précise.

⚠️ RÈGLES ABSOLUES :
- Strictement basé sur la source.
- Aucun fait inventé.
- Aucun chiffre inventé.
- Aucun acteur inventé.
- Aucune interprétation.
- Style sobre, professionnel.
- La synthèse doit TOUJOURS être rédigée en français,
  même si la source est en anglais.

==================== SOURCE ====================
Type : {source_type}
Texte :
{source_text}

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
(Liste des entreprises citées. Jamais de personnes physiques.
Si aucun, écris : Aucun.)

CONCEPTS
(Liste des concepts ou notions structurantes identifiées.
Si aucun, écris : Aucun.)
"""

    raw = run_llm(prompt)

    # ---------------------------------------------------------
    # PARSING EXACTEMENT COMME L'ANCIEN
    # ---------------------------------------------------------
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

        # Parsing strict comme avant
        if line.upper() in sections:
            current = line.upper()
            continue

        if current:
            sections[current] += line + "\n"

    title = sections["TITLE"].strip()
    excerpt = sections["EXCERPT"].strip()
    points_cles = sections["POINTS CLES"].strip()

    # ---------------------------------------------------------
    # LIST PARSER IDENTIQUE À L’ANCIEN
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
    concepts = parse_list(sections["CONCEPTS"])

    return {
        "title": title,
        "excerpt": excerpt,
        "content_body": points_cles,
        "citations": citations,
        "chiffres": chiffres,
        "acteurs_cites": acteurs,
        "concepts": concepts,   # brute, sans matching
    }
