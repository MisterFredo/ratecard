from typing import Dict, List, Optional
from core.lab_content.angles import propose_angles
from core.lab_content.service import transform_source_to_content
from utils.bigquery_utils import query_bq


# ============================================================
# LOAD CONCEPTS BY TOPICS (BACKEND SOURCE OF TRUTH)
# ============================================================
def load_concepts_by_topics(topic_ids: List[str]) -> List[Dict[str, str]]:
    if not topic_ids:
        return []

    placeholders = ",".join([f"'{tid}'" for tid in topic_ids])

    query = f"""
    SELECT ID_CONCEPT, TITLE, DESCRIPTION
    FROM `adex-5555.RATECARD.RATECARD_CONCEPT`
    WHERE ID_TOPIC IN ({placeholders})
    AND STATUS = 'PUBLISHED'
    """

    rows = query_bq(query)

    return [
        {
            "id": row["ID_CONCEPT"],
            "title": row["TITLE"],
            "description": row["DESCRIPTION"],
        }
        for row in rows
    ]


# ============================================================
# ANGLES — étape 1
# ============================================================
def generate_angles(
    source_type: Optional[str],
    source_text: str,
    context: Dict[str, List[str]],
):
    topic_ids = context.get("topics", [])

    available_concepts = load_concepts_by_topics(topic_ids)

    if not available_concepts:
        return []

    return propose_angles(
        source_type=source_type,
        source_text=source_text,
        context=context,
        available_concepts=available_concepts,
    )


# ============================================================
# CONTENT — étape 2
# ============================================================
def generate_content(
    source_type: Optional[str],
    source_text: str,
    angle_title: str,
    angle_signal: str,
    concept: str,          # phrase éditoriale
    concept_id: str,       # pivot gouverné
    context: Dict[str, List[str]],
):
    """
    Génère le contenu à partir d’un angle validé.
    concept_id = référence gouvernée (obligatoire)
    concept = formulation éditoriale libre
    """

    if not concept_id:
        raise ValueError("concept_id obligatoire")

    # On encapsule le pivot conceptuel
    selected_concepts = [
        {
            "id": concept_id,
            "title": concept,   # on conserve la phrase éditoriale
            "description": "",
        }
    ]

    content = transform_source_to_content(
        source_type=source_type,
        source_text=source_text,
        angle_title=angle_title,
        angle_signal=angle_signal,
        context=context,
        selected_concepts=selected_concepts,
    )

    # 🔒 On force la cohérence finale
    content["concept"] = concept
    content["concept_id"] = concept_id

    return content
