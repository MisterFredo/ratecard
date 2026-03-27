# core/mcp/intent.py

import unicodedata

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


def detect_intent(query: str) -> str:

    q = normalize(query)

    # 🔵 MARKET ANALYSIS
    if any(word in q for word in [
        "tendance",
        "tendances",
        "trend",
        "evolution",
        "marche",
        "analyse"
    ]):
        return "market_analysis"

    # 🟡 NEWS
    if any(word in q for word in [
        "news",
        "actualite",
        "dernieres",
        "recemment"
    ]):
        return "news_monitoring"

    # 🟢 BENCHMARK
    if any(word in q for word in [
        "vs",
        "compar",
        "compare",
        "difference",
        "meilleur",
        "domin"
    ]):
        return "benchmark"

    # 🔴 DEFAULT
    return "entity_focus"
