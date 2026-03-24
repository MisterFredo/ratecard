from typing import List, Dict
from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"


def get_news_by_ids(ids: List[str]) -> List[Dict]:
    """
    Récupère les news sélectionnées pour SCAN.
    """

    if not ids:
        return []

    rows = query_bq(
        f"""
        SELECT
            id_news,
            title,
            excerpt,
            published_at,
            news_type,
            news_kind,
            company_name,
            topics
        FROM `{VIEW_NEWS}`
        WHERE id_news IN UNNEST(@ids)
        ORDER BY published_at DESC
        """,
        {"ids": ids}
    )

    results = []

    for r in rows:
        results.append({
            "id": r.get("id_news"),
            "title": r.get("title"),
            "excerpt": r.get("excerpt"),
            "published_at": r.get("published_at"),
            "news_type": r.get("news_type"),
            "news_kind": r.get("news_kind"),
            "company": r.get("company_name"),
            "topics": r.get("topics") or [],
        })

    return results


def build_scan_payload(items: List[Dict]) -> Dict:
    """
    Payload prêt pour future génération (LLM).
    """

    return {
        "type": "scan",
        "count": len(items),
        "items": items
    }
