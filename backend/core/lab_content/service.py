import re
from typing import Dict, Any, List
from utils.llm import run_llm


# ============================================================
# IA CONTENT — SOURCE → CONTENT (PIVOT STRUCTURE ONLY)
# ============================================================
def transform_source_to_content(
    source_type: str,
    source_text: str,
    angle_title: str,
    angle_signal: str,
    context: Dict[str, Any],
    selected_concepts: List[Dict[str, str]],
) -> Dict[str, Any]:

    if not isinstance(source_text, str) or not source_text.strip():
        return {}

    # Pivot éditorial (informative only)
    pivot_concept = selected_concepts[0]["title"] if selected_concepts else ""

    prompt = f"""
Tu es un assistant d’analyse stratégique pour Curator.

Ta mission est d’aider un éditeur humain à formaliser
une THÈSE ANALYTIQUE exploitable.

⚠️ RÈGLES FONDAMENTALES :
- Tu travailles STRICTEMENT à partir de la source fournie.
- Tu n’inventes jamais de faits.
- Tu n’inventes jamais de chiffres.
- Tu n’inventes jamais de citations.
- Ton analytique B2B structuré.
- Pas de rédaction média.

==================== ANGLE ====================
Titre : {angle_title}
Signal : {angle_signal}

==================== CADRE ====================
L’analyse doit être cohérente avec le concept suivant :
{pivot_concept}

==================== SOURCE ====================
Type : {source_type}
Texte :
{source_text}

==================== FORMAT STRICT ====================

EXCERPT
(1 à 2 phrases.)

DEVELOPPEMENT
(3 blocs :
- Tension
- Mécanisme
- Conséquence)

CITATIONS
(Liste exacte ou "Aucun")

CHIFFRES
(Liste exacte ou "Aucun")

ACTEURS
(Liste entreprises ou "Aucun")
"""

    raw = run_llm(prompt)

    sections = {
        "EXCERPT": "",
        "DEVELOPPEMENT": "",
        "CITATIONS": "",
        "CHIFFRES": "",
        "ACTEURS": "",
    }

    current = None
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue

        if line.upper() in sections:
            current = line.upper()
            continue

        if current:
            sections[current] += line + "\n"

    excerpt = sections["EXCERPT"].strip()
    body = sections["DEVELOPPEMENT"].strip()

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

    if not excerpt and not body:
        clean = source_text.strip()
        return {
            "excerpt": angle_signal,
            "content_body": clean[:800],
            "citations": [],
            "chiffres": [],
            "acteurs": [],
        }

    return {
        "excerpt": excerpt,
        "content_body": body,
        "citations": citations,
        "chiffres": chiffres,
        "acteurs": acteurs,
    }
