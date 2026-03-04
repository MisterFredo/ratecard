import re
from typing import List, Dict
from utils.llm import run_llm


# ============================================================
# PROPOSE ANGLES — 1 ANGLE = 1 CONCEPT (VERSION STABLE)
# ============================================================
def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
    available_concepts: List[Dict[str, str]],
) -> List[Dict[str, str]]:
    """
    Génère de 1 à 3 angles maximum.

    Règles :
    - Chaque angle doit s'appuyer sur EXACTEMENT un concept.
    - Chaque concept ne peut apparaître qu'une seule fois.
    - Aucun concept hors liste autorisée.
    """

    if not isinstance(source_text, str) or not source_text.strip():
        return []

    # ---------------------------------------------------------
    # BUILD CONCEPT LIST FOR PROMPT
    # ---------------------------------------------------------
    concepts_block = "\n".join([
        f"- {c['title']}"
        for c in available_concepts
    ])

    prompt = f"""
Tu es un analyste stratégique B2B spécialisé en Adtech,
Retail Media et transformation digitale.

OBJECTIF :
Proposer de 1 à 3 angles éditoriaux maximum,
dérivés STRICTEMENT de la source fournie.

RÈGLES FONDAMENTALES :

- Chaque angle doit s'appuyer sur EXACTEMENT UN concept.
- Le champ Concept doit correspondre STRICTEMENT
  à l’un des concepts listés ci-dessous.
- Ne jamais inventer.
- Ne jamais reformuler un concept.
- Un concept ne peut apparaître qu’une seule fois.
- Ne produire plusieurs angles que s’ils sont réellement différenciés.

CONCEPTS AUTORISÉS :
{concepts_block}

FORMAT EXACT :

ANGLE
Titre : ...
Signal : ...
Concept : ...

ANGLE
Titre : ...
Signal : ...
Concept : ...

SOURCE :
{source_text}
"""

    raw = run_llm(prompt)
    angles = parse_multiple_angles(raw)

    if not angles:
        return []

    # ---------------------------------------------------------
    # SÉCURISATION BACKEND
    # ---------------------------------------------------------
    valid_titles = {c["title"] for c in available_concepts}
    used_concepts = set()
    cleaned_angles = []

    for angle in angles:
        concept = angle.get("concept")

        if not concept:
            continue

        if concept not in valid_titles:
            continue

        if concept in used_concepts:
            continue

        used_concepts.add(concept)
        cleaned_angles.append(angle)

        if len(cleaned_angles) == 3:
            break

    return cleaned_angles


# ============================================================
# PARSE MULTIPLE ANGLES (ROBUST)
# ============================================================
def parse_multiple_angles(text: str) -> List[Dict[str, str]]:
    if not isinstance(text, str):
        return []

    blocks = re.split(r"\bANGLE\b", text, flags=re.IGNORECASE)
    results = []

    for block in blocks:
        title_match = re.search(
            r"Titre\s*:\s*(.+)",
            block,
            flags=re.IGNORECASE,
        )

        signal_match = re.search(
            r"Signal\s*:\s*(.+)",
            block,
            flags=re.IGNORECASE,
        )

        concept_match = re.search(
            r"Concept\s*:\s*(.+)",
            block,
            flags=re.IGNORECASE,
        )

        if title_match and signal_match and concept_match:
            results.append({
                "angle_title": title_match.group(1).strip(),
                "angle_signal": signal_match.group(1).strip(),
                "concept": concept_match.group(1).strip(),
            })

    return results
