from typing import Dict

from core.feed.service import search_text


def handle_feed(entity: Dict, user_query: str) -> Dict:
    """
    Handler MCP pour :
    → découvrir les contenus (quoi de neuf)
    """

    # 1. query
    query = entity.get("label") or user_query

    # 2. récupération feed
    rows = search_text(query=query, limit=10)

    if not rows:
        return {
            "status": "empty",
            "intent": "feed",
            "entity": entity,
            "answer": {
                "items": []
            }
        }

    # 3. suggestions
    suggestions = [
        "Retail Media",
        "CTV",
        "Amazon",
        "Netflix"
    ]

    # 4. réponse
    return {
        "status": "ok",
        "intent": "feed",
        "entity": entity,
        "answer": {
            "items": rows
        },
        "meta": {
            "suggestions": suggestions
        }
    }
