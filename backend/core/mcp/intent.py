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

    # ----------------------------------------------------------
    # 🟠 NUMBERS
    # ----------------------------------------------------------
    if any(word in q for word in [
        "chiffre",
        "chiffres",
        "data",
        "donnee",
        "donnees",
        "stat",
        "stats",
        "kpi",
        "combien"
    ]):
        return "numbers"

    # ----------------------------------------------------------
    # 🟢 FEED (quoi de neuf)
    # ----------------------------------------------------------
    if any(word in q for word in [
        "news",
        "actualite",
        "actualites",
        "dernieres",
        "recent",
        "recemment",
        "quoi de neuf",
        "nouveau"
    ]):
        return "feed"

    # ----------------------------------------------------------
    # 🟣 UNDERSTAND (radar)
    # ----------------------------------------------------------
    if any(word in q for word in [
        "comprendre",
        "pourquoi",
        "explication",
        "expliquer",
        "vision",
        "lecture"
    ]):
        return "understand"

    # ----------------------------------------------------------
    # 🔵 ANALYSIS (lecture marché récente)
    # ----------------------------------------------------------
    if any(word in q for word in [
        "analyse",
        "tendance",
        "tendances",
        "trend",
        "marche",
        "evolution"
    ]):
        return "analysis"

    # ----------------------------------------------------------
    # 🟡 DEFAULT → FEED (important)
    # ----------------------------------------------------------
    return "feed"
