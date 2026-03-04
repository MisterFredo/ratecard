from typing import Dict, List, Optional
from core.lab_content.service import transform_source_to_content
from utils.bigquery_utils import query_bq


# ============================================================
# LOAD CONCEPTS BY TOPICS
# ============================================================
def load_concepts_by_topics(topic_ids: List[str]) -> List[Dict[str, str]]:

    if not topic_ids:
        return []

    query = """
        SELECT ID_CONCEPT, TITLE, DESCRIPTION
        FROM `adex-5555.RATECARD.RATECARD_CONCEPT`
        WHERE ID_TOPIC IN UNNEST(@topic_ids)
        AND STATUS = 'PUBLISHED'
    """

    rows = query_bq(
        query,
        {"topic_ids": topic_ids}
    )

    return [
        {
            "id": row["ID_CONCEPT"],
            "title": row["TITLE"],
            "description": row["DESCRIPTION"],
        }
        for row in rows
    ]


# ============================================================
# SUMMARY GENERATION
# ============================================================
def generate_summary(
    source_type: Optional[str],
    source_text: str,
    context: Dict[str, List[str]],
):
    """
    Génère :
    - title
    - excerpt
    - content_body
    - citations
    - chiffres
    - acteurs_cites

    En utilisant les concepts gouvernés liés aux topics.
    """

    topic_ids = context.get("topics", [])

    if not topic_ids:
        raise ValueError("Au moins un topic est requis")

    available_concepts = load_concepts_by_topics(topic_ids)

    if not available_concepts:
        raise ValueError("Aucun concept publié associé aux topics")

    content = transform_source_to_content(
        source_type=source_type,
        source_text=source_text,
        context=context,
        available_concepts=available_concepts,
    )

    return content
