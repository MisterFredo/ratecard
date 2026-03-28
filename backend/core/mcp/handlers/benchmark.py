from typing import Dict

from core.curator.service import search
from core.insight.service import run_insight_pipeline
from core.mcp.suggestions import build_suggestions


# ============================================================
# PARSE QUERY
# ============================================================

def _parse_entities(query: str):

    q = query.lower().replace("versus", "vs")

    if " vs " not in q:
        return None, None

    parts = q.split("vs")

    if len(parts) != 2:
        return None, None

    return parts[0].strip(), parts[1].strip()


# ============================================================
# HANDLER
# ============================================================

def handle_benchmark(user_query: str) -> Dict:

    e1, e2 = _parse_entities(user_query)

    if not e1 or not e2:
        return {
            "status": "error",
            "intent": "benchmark",
            "message": "Comparaison non valide"
        }

    # ----------------------------------------------------------
    # SEARCH
    # ----------------------------------------------------------

    rows_1 = search(q=e1, limit=5) or []
    rows_2 = search(q=e2, limit=5) or []

    rows = rows_1 + rows_2

    if not rows:
        return {
            "status": "empty",
            "intent": "benchmark",
            "answer": {
                "text": f"Aucune donnée disponible pour comparer {e1} et {e2}",
                "items": []
            }
        }

    # ----------------------------------------------------------
    # URL enrichissement
    # ----------------------------------------------------------

    for item in rows:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

    # ----------------------------------------------------------
    # ANALYSIS
    # ----------------------------------------------------------

    analysis_ids = [
        r["id"]
        for r in rows
        if r.get("type") == "analysis"
    ]

    analysis_text = None

    if analysis_ids:
        result = run_insight_pipeline(analysis_ids)
        analysis_text = result.get("insight")

    # ----------------------------------------------------------
    # SUGGESTIONS
    # ----------------------------------------------------------

    suggestions = build_suggestions(
        intent="benchmark",
        entity={"label": f"{e1} vs {e2}"},
        items=rows
    )

    # ----------------------------------------------------------
    # RESPONSE
    # ----------------------------------------------------------

    return {
        "status": "ok",
        "intent": "benchmark",
        "entity": {
            "type": "comparison",
            "label": f"{e1} vs {e2}"
        },
        "answer": {
            "analysis": analysis_text,
            "items": rows
        },
        "meta": {
            "suggestions": suggestions
        }
    }
