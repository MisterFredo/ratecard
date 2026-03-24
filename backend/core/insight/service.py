from typing import List, Dict
from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET

TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


def get_contents_by_ids(ids: List[str]) -> List[Dict]:
    """
    Récupère les contenus enrichis pour génération d'insights.
    """

    if not ids:
        return []

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          TITLE,
          EXCERPT,
          CONTENT_BODY,
          MECANIQUE_EXPLIQUEE,
          ENJEU_STRATEGIQUE,
          POINT_DE_FRICTION,
          SIGNAL_ANALYTIQUE,
          CHIFFRES,
          CITATIONS
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT IN UNNEST(@ids)
        """,
        {"ids": ids}
    )

    # 🔹 Normalisation
    results = []

    for r in rows:
        results.append({
            "id": r["ID_CONTENT"],
            "title": r.get("TITLE"),
            "excerpt": r.get("EXCERPT"),
            "content_body": r.get("CONTENT_BODY"),
            "mecanique": r.get("MECANIQUE_EXPLIQUEE"),
            "enjeu": r.get("ENJEU_STRATEGIQUE"),
            "friction": r.get("POINT_DE_FRICTION"),
            "signal": r.get("SIGNAL_ANALYTIQUE"),
            "chiffres": r.get("CHIFFRES") or [],
            "citations": r.get("CITATIONS") or [],
        })

    return results
