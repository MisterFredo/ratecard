from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq
from utils.llm import run_llm
from core.numbers.insight_service import get_numbers_by_ids


TABLE_NUMBERS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NUMBERS_ENRICHED"


# ============================================================
# FETCH NUMBERS BY IDS
# ============================================================

def get_numbers_by_ids(ids: List[str]) -> List[Dict]:

    if not ids:
        return []

    rows = query_bq(
        f"""
        SELECT
            ID_NUMBER,
            ENTITY_TYPE,
            ENTITY_ID,
            ENTITY_LABEL,

            LABEL,
            VALUE,
            UNIT,
            SCALE,

            TYPE,
            CATEGORY,

            ZONE,
            PERIOD,
            CREATED_AT

        FROM `{TABLE_NUMBERS}`
        WHERE ID_NUMBER IN UNNEST(@ids)
        """,
        {"ids": ids}
    )

    # 👉 on normalise pour le LLM
    return [
        {
            "id": r.get("ID_NUMBER"),
            "label": r.get("LABEL"),
            "value": r.get("VALUE"),
            "unit": r.get("UNIT"),
            "scale": r.get("SCALE"),

            "type": r.get("TYPE"),
            "category": r.get("CATEGORY"),

            "zone": r.get("ZONE"),
            "period": r.get("PERIOD"),

            "entity_type": r.get("ENTITY_TYPE"),
            "entity_id": r.get("ENTITY_ID"),
            "entity_label": r.get("ENTITY_LABEL"),
        }
        for r in rows
    ]

# ============================================================
# BUILD PROMPT
# ============================================================

def build_numbers_prompt(numbers: List[Dict]) -> str:

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

    return f"""
Tu es un assistant DATA pour un expert métier.

OBJECTIF
Structurer une sélection de chiffres pour une présentation.

CONTEXTE
{context}

TÂCHE

1. Regrouper les chiffres par logique
2. Organiser du plus structurant au plus opérationnel

OUTPUT

STRUCTURE

- Bloc 1 → thème
  - chiffre
  - chiffre

- Bloc 2 → thème

LECTURE

- ce que ces chiffres racontent

RÈGLES

- pas d’invention
- pas de storytelling
- uniquement structuration
"""


# ============================================================
# MAIN PIPELINE
# ============================================================

def generate_numbers_insight(ids: List[str]) -> str:

    if not ids:
        return ""

    numbers = get_numbers_by_ids(ids)

    if not numbers:
        return ""

    prompt = build_numbers_prompt(numbers)

    result = run_llm(
        prompt=prompt,
        temperature=0.2,
    )

    return result or ""
