# core/mcp/intent.py

import unicodedata


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


# ============================================================
# DETECT INTENT
# ============================================================

def detect_intent(query: str) -> str:

    q = normalize(query)

    # 🟢 FEED (PRIORITAIRE)
    if any(word in q for word in [
        "quoi de neuf",
        "actualite",
        "actualites",
        "news",
        "dernieres",
        "recent",
        "recemment",
        "nouveau",
        "nouveautes"
    ]):
        return "feed"

    # 🔵 ANALYSIS
    if any(word in q for word in [
        "tendance",
        "tendances",
        "trend",
        "evolution",
        "analyse"
    ]):
        return "analysis"

    # 🟣 UNDERSTAND
    if any(word in q for word in [
        "comprendre",
        "expliquer",
        "definition",
        "c est quoi",
        "c'est quoi"
    ]):
        return "understand"

    # 🟡 NUMBERS
    if any(word in q for word in [
        "chiffre",
        "chiffres",
        "donnees",
        "data",
        "stat"
    ]):
        return "numbers"

    # 🔴 DEFAULT
    return "entity_focus"
