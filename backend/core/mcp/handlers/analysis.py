from typing import Dict

from core.feed.service import search_text

def handle_analysis(entity, user_query):

    query = entity.get("label") or user_query

    rows = search_text(query=query, limit=10)

    ids = [
        r["id"]
        for r in rows
        if r.get("type") == "analysis"
    ]

    result = run_insight_pipeline(ids)

    return {
        "intent": "analysis",
        "answer": {
            "text": result.get("insight"),
            "nb_contents": len(ids)
        }
    }
