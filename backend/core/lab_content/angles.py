import re
from typing import List, Dict
from utils.llm import run_llm


# ============================================================
# PROPOSE ANGLES — STRUCTURED STRATEGIC PASS + CONCEPT SUGGESTION
# ============================================================
def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
    available_concepts: List[Dict[str, str]],
) -> List[Dict[str, str]]:
    """
    Génère de 1 à 3 angles éditoriaux maximum,
    dérivés strictement des tensions internes de la source.

    Pour chaque angle :
    - Propose jusqu'à 3 concepts maximum
    - Sélectionne uniquement parmi les concepts fournis
    - Ne jamais inventer de concept
    """

    if not isinstance(source_text, str) or not source_text.strip():
        return []

    # ---------------------------------------------------------
    # BUILD CONCEPTS BLOCK FOR PROMPT
    # ---------------------------------------------------------
    concepts_block = "\n".join([
        f"- {c['id']} | {c['title']} : {c['description']}"
        for c in available_concepts
    ])

    prompt = f"""
Tu es un analyste stratégique B2B spécialisé en Adtech,
Retail Media et transformation digitale.

OBJECTIF :
Produire de 1 à 3 angles éditoriaux maximum,
dérivés STRICTEMENT de la source fournie.

ÉTAPE 1 — Résumé factuel
Résume en 5 points maximum les idées clés du texte.

ÉTAPE 2 — Tensions internes
Identifie les tensions structurantes présentes
dans le texte (oppositions, mutation métier,
bascule de pouvoir, dépendance, arbitrage, etc.).

ÉTAPE 3 — Angles éditoriaux
Formule jusqu’à 3 angles distincts UNIQUEMENT si réellement différenciés.

Pour chaque angle :
- Sélectionne de 1 à 3 concepts maximum.
- Utilise UNIQUEMENT les ID fournis.
- Ne jamais inventer.
- Ne jamais reformuler un concept.
- Si aucun concept pertinent, laisser vide.

RÈGLES GÉNÉRALES :
- Ne produis pas artificiellement 3 angles.
- Si la source est mono-thèse, propose un seul angle.
- Chaque angle doit être autonome.
- Pas d’extrapolation hors texte.
- Pas de reformulation descriptive faible.

CONCEPTS DISPONIBLES :
{concepts_block}

FORMAT EXACT :

ANGLE
Titre : ...
Signal : ...
Concepts : id1, id2

ANGLE
Titre : ...
Signal : ...
Concepts : id3

SOURCE :
{source_text}
"""

    raw = run_llm(prompt)
    angles = parse_multiple_angles(raw)

    # ---------------------------------------------------------
    # SÉCURITÉ : max 3 angles
    # ---------------------------------------------------------
    if not angles:
        return [{
            "angle_title": source_text.strip().split("\n")[0][:120],
            "angle_signal": source_text.strip()[:300],
            "suggested_concepts": [],
        }]

    angles = angles[:3]

    # ---------------------------------------------------------
    # VALIDATION DES CONCEPTS (NE JAMAIS FAIRE CONFIANCE AU LLM)
    # ---------------------------------------------------------
    valid_ids = {c["id"] for c in available_concepts}

    for angle in angles:
        clean_ids = []
        for cid in angle.get("suggested_concepts", []):
            if cid in valid_ids:
                clean_ids.append(cid)

        # Max 3 concepts
        angle["suggested_concepts"] = clean_ids[:3]

    return angles


# ============================================================
# PARSE MULTIPLE ANGLES (ROBUST + CONCEPTS)
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

        concepts_match = re.search(
            r"Concepts\s*:\s*(.+)",
            block,
            flags=re.IGNORECASE,
        )

        if title_match and signal_match:
            concepts = []

            if concepts_match:
                raw_ids = concepts_match.group(1)
                concepts = [
                    cid.strip()
                    for cid in raw_ids.split(",")
                    if cid.strip()
                ]

            results.append({
                "angle_title": title_match.group(1).strip(),
                "angle_signal": signal_match.group(1).strip(),
                "suggested_concepts": concepts,
            })

    return results
