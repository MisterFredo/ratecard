import unicodedata


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


# ============================================================
# KEYWORDS CONFIG
# ============================================================

INTENT_KEYWORDS = {

    "feed": [
        "quoi de neuf", "actualite", "actualites", "news",
        "dernieres", "recent", "recemment", "nouveau", "nouveautes"
    ],

    "numbers": [
        "chiffre", "chiffres", "donnee", "donnees", "data",
        "stat", "stats", "revenu", "croissance", "kpi", "volume"
    ],

    "topic": [
        "tendance", "tendances", "trend", "evolution",
        "marche", "analyse", "comprendre", "expliquer",
        "definition", "c est quoi", "c'est quoi"
    ],

    "benchmark": [
        "vs", "versus", "compar", "compare", "difference",
        "meilleur", "moins bon"
    ],

    # 🔥 NEW → très important pour ton produit
    "agentic": [
        "ia", "ai", "genai", "chatgpt", "agent",
        "assistant", "copilot"
    ]
}


# ============================================================
# DETECT INTENT (V2 ROBUSTE)
# ============================================================

def detect_intent(query: str) -> str:

    q = normalize(query)

    # ----------------------------------------------------------
    # 🔴 PRIORITÉ 1 → BENCHMARK (comparaison)
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["benchmark"]):
        return "benchmark"

    # ----------------------------------------------------------
    # 🟡 PRIORITÉ 2 → NUMBERS (data explicite)
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["numbers"]):
        return "numbers"

    # ----------------------------------------------------------
    # 🟢 PRIORITÉ 3 → FEED (actualité)
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["feed"]):
        return "feed"

    # ----------------------------------------------------------
    # 🔵 PRIORITÉ 4 → AGENTIC / IA
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["agentic"]):
        return "topic"

    # ----------------------------------------------------------
    # 🔵 PRIORITÉ 5 → TOPIC (analyse)
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["topic"]):
        return "topic"

    # ----------------------------------------------------------
    # ⚪ DEFAULT → ENTITY
    # ----------------------------------------------------------
    return "entity"
