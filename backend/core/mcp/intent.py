import unicodedata


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


# ============================================================
# KEYWORDS CONFIG (CORRIGÉ)
# ============================================================

INTENT_KEYWORDS = {

    "feed": [
        "quoi de neuf", "actualite", "actualites", "news",
        "dernieres", "recent", "recemment", "nouveau", "nouveautes"
    ],

    # 🔥 plus strict
    "numbers": [
        "chiffre", "chiffres",
        "donnee", "donnees",
        "stat", "stats",
        "kpi"
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

    "agentic": [
        "ia", "ai", "genai", "chatgpt", "agent",
        "assistant", "copilot"
    ]
}


# ============================================================
# DETECT INTENT (STABLE)
# ============================================================

def detect_intent(query: str) -> str:

    q = normalize(query)

    # ----------------------------------------------------------
    # 🔴 BENCHMARK
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["benchmark"]):
        return "benchmark"

    # ----------------------------------------------------------
    # 🟡 NUMBERS (STRICT)
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["numbers"]):
        return "numbers"

    # ----------------------------------------------------------
    # 🟢 FEED
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["feed"]):
        return "feed"

    # ----------------------------------------------------------
    # 🔵 AGENTIC
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["agentic"]):
        return "topic"

    # ----------------------------------------------------------
    # 🔵 TOPIC
    # ----------------------------------------------------------
    if any(word in q for word in INTENT_KEYWORDS["topic"]):
        return "topic"

    # ----------------------------------------------------------
    # ⚪ DEFAULT
    # ----------------------------------------------------------
    return "entity"
