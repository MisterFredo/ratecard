import re
from typing import List, Dict
from utils.llm import run_llm


# ============================================================
# PROPOSE ANGLES — VERSION STABLE (5 ANGLES MAX)
# ============================================================
def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
    available_concepts: List[Dict[str, str]],
) -> List[Dict[str, str]]:
    """
    Génère EXACTEMENT 5 angles distincts si possible.

    Règles :
    - 1 angle = 1 concept
    - Concept strictement issu de la liste autorisée
    - Pas de doublon concept
    - Nettoyage backend sécurisé
    """

    if not isinstance(source_text, str) or not source_text.strip():
        return []

    if not available_concepts:
        return []

    # ---------------------------------------------------------
    # BUILD CONCEPT LIST FOR PROMPT
    # ---------------------------------------------------------
    concepts_block = "\n".join(
        [f"- {c['title']}" for c in available_concepts]
    )

    prompt = f"""
Tu es un analyste stratégique B2B spécialisé en Adtech,
Retail Media et transformation digitale.

OBJECTIF :

Produire EXACTEMENT 5 angles éditoriaux distincts
à partir de la source fournie.

Si la source est très focalisée, explore différentes tensions
stratégiques possibles : technologique, gouvernance, pouvoir
de marché, modèle économique, dépendance, efficacité opérationnelle.

ÉTAPE 1 (réflexion interne, ne pas afficher) :
Identifie 5 concepts DISTINCTS pertinents parmi la liste autorisée.

ÉTAPE 2 :
Construis un angle stratégique par concept.

RÈGLES OBLIGATOIRES :

- Chaque angle doit s’appuyer sur EXACTEMENT UN concept.
- Le champ Concept doit correspondre STRICTEMENT
  à l’un des concepts listés ci-dessous (copie exacte).
- Chaque concept ne peut apparaître qu’une seule fois.
- Les angles doivent être réellement différenciés.
- Pas de variation superficielle.
- Strictement basé sur la source.

CONCEPTS AUTORISÉS :
{concepts_block}

FORMAT STRICT :

ANGLE
Titre : ...
Signal : ...
Concept : ...

ANGLE
Titre : ...
Signal : ...
Concept : ...

ANGLE
Titre : ...
Signal : ...
Concept : ...

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
    # BACKEND VALIDATION + CONCEPT_ID ATTACHMENT
    # ---------------------------------------------------------
    valid_map = {c["title"]: c["id"] for c in available_concepts}
    used_concepts = set()
    cleaned_angles = []

    for angle in angles:
        concept_title = angle.get("concept")

        if not concept_title:
            continue

        if concept_title not in valid_map:
            continue

        if concept_title in used_concepts:
            continue

        used_concepts.add(concept_title)

        cleaned_angles.append({
            "angle_title": angle["angle_title"],
            "angle_signal": angle["angle_signal"],
            "concept": concept_title,
            "concept_id": valid_map[concept_title],
        })

        if len(cleaned_angles) == 5:
            break

    return cleaned_angles


# ============================================================
# PARSE MULTIPLE ANGLES — ROBUST
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
