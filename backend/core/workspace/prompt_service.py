from typing import Dict, List


# ============================================================
# CONTENT BLOCKS
# ============================================================

def build_content_blocks(
    contents: List[Dict],
) -> str:

    if not contents:
        return "Aucun contenu."

    blocks = []

    for c in contents:

        block = f"""
TITRE:
{c.get("title")}

CONTENU:
{c.get("content_body")}

SIGNAL:
{c.get("signal")}

MECANIQUE:
{c.get("mecanique")}

ENJEU:
{c.get("enjeu")}

FRICTION:
{c.get("friction")}

CHIFFRES:
{c.get("chiffres")}
"""

        blocks.append(
            block.strip()
        )

    return "\n\n====================\n\n".join(
        blocks
    )


# ============================================================
# NUMBER BLOCKS
# ============================================================

def build_number_blocks(
    numbers: List[Dict],
) -> str:

    if not numbers:
        return "Aucun chiffre."

    blocks = []

    for n in numbers:

        block = f"""
LABEL:
{n.get("label")}

VALUE:
{n.get("value")} {n.get("unit")} {n.get("scale")}

TYPE:
{n.get("type")}

CATEGORY:
{n.get("category")}

ZONE:
{n.get("zone")}

PERIOD:
{n.get("period")}

ENTITY:
{n.get("entity_label")}
"""

        blocks.append(
            block.strip()
        )

    return "\n\n-----------------\n\n".join(
        blocks
    )


# ============================================================
# KEY POINTS PROMPT
# ============================================================

def build_key_points_prompt(
    context: Dict,
) -> str:

    contents = context.get(
        "contents",
        [],
    )

    numbers = context.get(
        "numbers",
        [],
    )

    content_context = (
        build_content_blocks(
            contents
        )
    )

    number_context = (
        build_number_blocks(
            numbers
        )
    )

    return f"""
Tu es un assistant de SYNTHÈSE FACTUELLE pour un expert métier.

Tu travailles sur des signaux déjà structurés.
Tu ne dois PAS interpréter.
Tu dois PRIORISER et ORGANISER.

--------------------------------------------------
OBJECTIF

Faire gagner du temps à un professionnel :
→ il ne veut PAS lire tous les contenus
→ il veut comprendre ce qu’il faut retenir

--------------------------------------------------
CONTENUS
{content_context}

--------------------------------------------------
CHIFFRES
{number_context}

--------------------------------------------------
TÂCHE

1. IDENTIFIER les signaux récurrents
2. PRIORISER les éléments importants
3. RELIER les chiffres aux tendances
4. REGROUPER les informations similaires
5. EXTRAIRE les faits réellement utiles

--------------------------------------------------
FORMAT STRICT

TOP 5

- [CONCEPT] → fait + chiffre

À NOTER

- [CONCEPT] → fait secondaire

--------------------------------------------------
RÈGLES

- MAX 5 points dans TOP 5
- MAX 5 points dans À NOTER
- PAS de storytelling
- PAS de résumé article par article
- PAS de remplissage
- PAS d’invention
- REGROUPER les signaux similaires
- PRIORISER l’impact métier

Tu es un filtre métier, pas un rédacteur.
""".strip()


# ============================================================
# STRUCTURE PROMPT
# ============================================================

def build_structure_prompt(
    context: Dict,
) -> str:

    contents = context.get(
        "contents",
        [],
    )

    numbers = context.get(
        "numbers",
        [],
    )

    content_context = (
        build_content_blocks(
            contents
        )
    )

    number_context = (
        build_number_blocks(
            numbers
        )
    )

    return f"""
Tu es un assistant DATA pour un expert métier.

Tu travailles sur des informations déjà sélectionnées.
Tu ne dois PAS inventer.
Tu dois STRUCTURER.

--------------------------------------------------
OBJECTIF

Transformer différentes informations en :

1. une STRUCTURE logique
2. un ORDRE de présentation
3. une LECTURE business claire

--------------------------------------------------
CONTENUS
{content_context}

--------------------------------------------------
CHIFFRES
{number_context}

--------------------------------------------------
TÂCHE

1. REGROUPER les informations par logique métier
2. IDENTIFIER les niveaux :
   - taille
   - croissance
   - performance
   - signaux marché
3. ORGANISER :
   - du plus structurant au plus opérationnel
4. UTILISER les contenus pour contextualiser les chiffres
5. CONSTRUIRE une structure exploitable rapidement

--------------------------------------------------
FORMAT

STRUCTURE

- Bloc → thème + logique
  - information
  - information

LECTURE

- ce que racontent les données
- sans storytelling
- sans interprétation libre

--------------------------------------------------
RÈGLES

- pas de résumé
- pas de blabla
- pas d’invention
- uniquement structuration + logique
- regrouper les informations similaires

Tu es un outil d’organisation, pas un analyste.
""".strip()
