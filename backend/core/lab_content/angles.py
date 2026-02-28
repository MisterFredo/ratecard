import re
from typing import List, Dict
from utils.llm import run_llm


# ============================================================
# PROPOSE ANGLES — STRUCTURED STRATEGIC PASS
# ============================================================
def propose_angles(
    source_type: str,
    source_text: str,
    context: Dict[str, List[str]],
) -> List[Dict[str, str]]:
    """
    Génère de 1 à 3 angles éditoriaux maximum,
    dérivés strictement des tensions internes de la source.

    - Un seul appel LLM
    - Pas de grille fixe
    - Pas de production artificielle
    """

    if not isinstance(source_text, str) or not source_text.strip():
        return []

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
dans le texte (oppositions, bascule de pouvoir,
mutation métier, dépendance, etc.).

ÉTAPE 3 — Angles éditoriaux
Formule jusqu’à 3 angles distincts UNIQUEMENT si réellement différenciés.

RÈGLES :
- Ne produis pas artificiellement 3 angles.
- Si la source est mono-thèse, propose un seul angle.
- Chaque angle doit être autonome.
- Pas de reformulation descriptive.
- Pas d’extrapolation hors texte.
- Ne commence pas systématiquement par “L’impact de” ou “L’importance de”.

FORMAT EXACT :

ANGLE
Titre : ...
Signal : ...

ANGLE
Titre : ...
Signal : ...

ANGLE
Titre : ...
Signal : ...

SOURCE :
{source_text}
"""

    raw = run_llm(prompt)
    angles = parse_multiple_angles(raw)

    # ---------------------------------------------------------
    # SÉCURITÉ : max 3 angles
    # ---------------------------------------------------------
    if angles:
        return angles[:3]

    # ---------------------------------------------------------
    # FALLBACK UX
    # ---------------------------------------------------------
    return [{
        "angle_title": source_text.strip().split("\n")[0][:120],
        "angle_signal": source_text.strip()[:300],
    }]


# ============================================================
# PARSE MULTIPLE ANGLES (robuste)
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

        if title_match and signal_match:
            results.append({
                "angle_title": title_match.group(1).strip(),
                "angle_signal": signal_match.group(1).strip(),
            })

    return results
