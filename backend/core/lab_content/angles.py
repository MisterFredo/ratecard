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

IMPORTANT :

1) Si la source est explicitement centrée sur un concept précis
présent dans la liste autorisée, ce concept DOIT
obligatoirement apparaître parmi les angles proposés.

2) Les 4 autres angles doivent explorer des tensions
stratégiques différentes :
- gouvernance
- pouvoir de marché
- modèle économique
- dépendance technologique
- efficacité opérationnelle
- impact concurrentiel

ÉTAPE 1 (raisonnement interne, ne pas afficher) :
- Identifier le concept central éventuel.
- Sélectionner 5 concepts DISTINCTS dans la liste autorisée.
- Vérifier qu’ils ne sont pas redondants.

ÉTAPE 2 :
Construire un angle stratégique par concept.

RÈGLES STRICTES :

- 1 angle = EXACTEMENT 1 concept.
- Le champ Concept doit correspondre STRICTEMENT
  à un concept de la liste (copie exacte).
- Aucun concept ne peut apparaître deux fois.
- Pas de variation superficielle.
- Pas d’angles redondants.
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
