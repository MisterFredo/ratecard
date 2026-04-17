import re
from typing import Dict, Any
from utils.llm import run_llm


# ============================================================
# IA SUMMARY — VERSION STABLE
# ============================================================
def transform_source_to_content(
    source_type: str,
    source_text: str,
    context: Dict[str, Any],
) -> Dict[str, Any]:

    if not isinstance(source_text, str) or not source_text.strip():
        return {}

    prompt = f"""
Tu es un assistant de synthèse B2B.

RÈGLES ABSOLUES :
- Strictement basé sur la source.
- Aucun fait inventé.
- Aucun chiffre inventé.
- Aucun acteur inventé.
- Rédige TOUJOURS en français.

================ SOURCE ================
Type : {source_type}
{source_text}

================ FORMAT OBLIGATOIRE ================

TITLE
(Titre factuel.)

EXCERPT
(1 à 2 phrases synthétiques.)

POINTS CLES
(Liste factuelle.)

CHIFFRES
(Liste exacte ou "Aucun")

ACTEURS
(Liste des entreprises citées ou "Aucun")

CONCEPTS
(Liste des notions structurantes ou "Aucun")
"""

    raw = run_llm(prompt)

    # ---------------------------------------------------------
    # PARSING ROBUSTE
    # ---------------------------------------------------------

    sections = {
        "TITLE": "",
        "EXCERPT": "",
        "POINTS CLES": "",
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

        # Détection tolérante
        for key in sections.keys():
            if normalized.startswith(key):
                current = key
                break
        else:
            if current:
                sections[current] += clean + "\n"

    # ---------------------------------------------------------
    # EXTRACTION
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

    return {
        "title": sections["TITLE"].strip(),
        "excerpt": sections["EXCERPT"].strip(),
        "content_body": sections["POINTS CLES"].strip(),
        "chiffres": parse_list(sections["CHIFFRES"]),
        "acteurs_cites": parse_list(sections["ACTEURS"]),
        "concepts": parse_list(sections["CONCEPTS"]),
    }


