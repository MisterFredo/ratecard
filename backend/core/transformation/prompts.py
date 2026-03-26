from typing import List, Dict


# ============================================================
# MAIN ENTRY
# ============================================================

def build_prompt(mode: str, data: List[Dict]) -> str:

    if mode == "numbers":
        return build_numbers_prompt(data)

    if mode == "feed":
        return build_feed_prompt(data)

    return "Aucune donnée."


# ============================================================
# NUMBERS PROMPT (🔥 CORE)
# ============================================================

def build_numbers_prompt(numbers: List[Dict]) -> str:

    if not numbers:
        return "Aucune donnée."

    # ========================================================
    # FORMAT DATA
    # ========================================================

    blocks = []

    for n in numbers:
        block = f"""
LABEL: {n.get("label")}
VALUE: {n.get("value")} {n.get("unit")} {n.get("scale")}
TYPE: {n.get("type")}
CATEGORY: {n.get("category")}
ZONE: {n.get("zone")}
PERIOD: {n.get("period")}
ENTITY: {n.get("entity_label")}
"""
        blocks.append(block.strip())

    context = "\n\n-----------------\n\n".join(blocks)

    # ========================================================
    # PROMPT
    # ========================================================

    return f"""
Tu es un assistant DATA pour un expert métier.

Tu travailles sur des chiffres déjà sélectionnés.
Tu ne dois PAS inventer.
Tu dois STRUCTURER.

--------------------------------------------------
OBJECTIF

Transformer une liste de chiffres en :

1. une STRUCTURE logique
2. un ORDRE de présentation
3. une LECTURE business claire

--------------------------------------------------
CONTEXTE
{context}

--------------------------------------------------
TÂCHE

1. REGROUPER les chiffres par logique (ex: marché, performance, adoption…)
2. IDENTIFIER les niveaux :
   - taille
   - croissance
   - performance
3. ORGANISER :
   - du plus structurant au plus opérationnel

--------------------------------------------------
OUTPUT

STRUCTURE

- Bloc 1 → thème + logique
  - chiffre
  - chiffre

- Bloc 2 → thème + logique

--------------------------------------------------

LECTURE

- ce que ces chiffres racontent
- sans interprétation libre
- sans storytelling

--------------------------------------------------

RÈGLES

- pas de résumé
- pas d’invention
- pas de blabla
- uniquement structuration + logique

Tu es un outil d’organisation, pas un analyste.
""".strip()


# ============================================================
# FEED PROMPT (reuse simple)
# ============================================================

def build_feed_prompt(analyses: List[Dict]) -> str:

    if not analyses:
        return "Aucune donnée."

    blocks = []

    for a in analyses:
        block = f"""
TITLE: {a.get("title")}
CONTENT: {a.get("content_body")}
SIGNAL: {a.get("signal")}
CHIFFRES: {a.get("chiffres")}
"""
        blocks.append(block.strip())

    context = "\n\n====================\n\n".join(blocks)

    return f"""
Tu es un assistant de synthèse.

OBJECTIF :
Faire ressortir les points clés.

CONTEXTE:
{context}

TÂCHE:

TOP 5
- concept → fait + chiffre

À NOTER
- concept → fait

RÈGLES:
- pas d’invention
- pas de résumé narratif
- uniquement structuration
""".strip()
