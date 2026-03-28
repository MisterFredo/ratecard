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
    # 🟢 FEED → "quoi de neuf"
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
    # 🟡 NUMBERS → chiffres / data
    # ----------------------------------------------------------
    if any(word in q for word in [
        "chiffre",
        "chiffres",
        "donnee",
        "donnees",
        "data",
        "stat",
        "stats",
        "revenu",
        "croissance"
    ]):
        return "numbers"

    # ----------------------------------------------------------
    # 🔵 TOPIC → comprendre un sujet
    # ----------------------------------------------------------
    if any(word in q for word in [
        "tendance",
        "tendances",
        "trend",
        "evolution",
        "marche",
        "analyse",
        "comprendre",
        "expliquer",
        "definition",
        "c est quoi",
        "c'est quoi"
    ]):
        return "topic"

    # ----------------------------------------------------------
    # 🔴 DEFAULT → entity (company / topic / search)
    # ----------------------------------------------------------
    return "entity"
