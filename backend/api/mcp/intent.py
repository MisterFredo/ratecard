# core/mcp/intent.py

def detect_intent(query: str) -> str:

    q = query.lower()

    if "tendance" in q or "trend" in q:
        return "market_analysis"

    if "news" in q or "actualité" in q:
        return "news_monitoring"

    if "vs" in q or "compar" in q:
        return "benchmark"

    return "entity_focus"
