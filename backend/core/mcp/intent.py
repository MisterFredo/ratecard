import unicodedata


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


# ============================================================
# DETECT INTENT (SIMPLIFIÉ PRODUIT)
# ============================================================

def detect_intent(query: str) -> str:

    q = normalize(query)

    # ----------------------------------------------------------
    # 🟡 NUMBERS (PRIORITAIRE)
    # ----------------------------------------------------------
    if any(word in q for word in [
        "chiffre", "chiffres",
        "donnee", "donnees",
        "data",
        "stat", "stats",
        "revenu", "revenus",
        "croissance",
        "kpi",
        "volume",
        "gmv",
        "ca",
        "part de marche",
        "market share",
        "taux",
        "combien",
        "quel est", "quelle est",
    ]):
        return "numbers"

    # ----------------------------------------------------------
    # 🟣 BENCHMARK
    # ----------------------------------------------------------
    if any(word in q for word in [
        "vs",
        "versus",
        "compar",
        "compare",
        "difference"
    ]):
        return "benchmark"

    # ----------------------------------------------------------
    # 🟢 FEED
    # ----------------------------------------------------------
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

    # ----------------------------------------------------------
    # 🔵 TOPIC (RÉDUIT)
    # ----------------------------------------------------------
    if any(word in q for word in [
        "tendance",
        "tendances",
        "trend",
        "evolution",
        "marche",
        "comprendre",
        "expliquer",
        "definition",
        "c est quoi",
        "c'est quoi"
    ]):
        return "topic"

    # ----------------------------------------------------------
    # 🔴 DEFAULT
    # ----------------------------------------------------------
    return "entity"
