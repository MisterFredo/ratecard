from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq
from utils.llm import run_llm


# ============================================================
# TABLE
# ============================================================

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.V_NUMBERS_ENRICHED"


# ============================================================
# FETCH NUMBERS
# ============================================================

def get_numbers_by_ids(ids: List[str]) -> List[Dict]:

    if not ids:
        return []

    rows = query_bq(
        f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ID_NUMBER IN UNNEST(@ids)
        """,
        {"ids": ids}
    )

    return rows


# ============================================================
# PROMPT
# ============================================================

def build_prompt(numbers: List[Dict]):

    blocks = []

    for n in numbers:
        block = f"""
LABEL: {n.get("LABEL")}
VALUE: {n.get("VALUE")} {n.get("UNIT")}
TYPE: {n.get("TYPE")}
CATEGORY: {n.get("CATEGORY")}
ZONE: {n.get("ZONE")}
PERIOD: {n.get("PERIOD")}
ENTITY: {n.get("ENTITY_LABEL")}
"""
        blocks.append(block.strip())

    context = "\n\n---\n\n".join(blocks)

    prompt = f"""
Tu es un assistant expert en structuration de données pour présentation.

--------------------------------------------------
OBJECTIF

L'utilisateur a sélectionné plusieurs chiffres.

Il veut :
→ organiser les données
→ construire une logique claire
→ structurer une présentation

--------------------------------------------------
CONTEXTE
{context}

--------------------------------------------------
TÂCHE

1. ORGANISER les chiffres dans un ordre logique
2. PROPOSER une structure de présentation
3. ASSOCIER les chiffres aux sections
4. EXPLIQUER la logique

--------------------------------------------------
FORMAT

STRUCTURE

1. [Titre]
→ logique

CHIFFRES

- [LABEL] → valeur → rôle

---

2. [Titre]
...

--------------------------------------------------
RÈGLES

- PAS d’invention
- PAS de chiffres ajoutés
- PAS de résumé
- PAS de storytelling

Tu aides à structurer une présentation.
"""

    return prompt.strip()


# ============================================================
# LLM
# ============================================================

def generate_numbers_structure(numbers: List[Dict]) -> str:

    if not numbers:
        return "Aucune donnée."

    prompt = build_prompt(numbers)

    result = run_llm(
        prompt=prompt,
        temperature=0.2,
    )

    return result or "Impossible de générer."


# ============================================================
# PIPELINE
# ============================================================

def run_numbers_pipeline(ids: List[str]):

    if not ids:
        return {
            "status": "empty",
            "insight": "",
        }

    numbers = get_numbers_by_ids(ids)

    insight = generate_numbers_structure(numbers)

    return {
        "status": "ok",
        "insight": insight,
    }
