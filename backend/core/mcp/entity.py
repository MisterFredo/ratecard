import unicodedata
from functools import lru_cache

from utils.bigquery_utils import query_bq


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


# ============================================================
# LOAD ENTITIES (CACHE)
# ============================================================

@lru_cache(maxsize=1)
def _get_topics():
    rows = query_bq("""
        SELECT LABEL
        FROM `adex-5555.RATECARD_PROD.RATECARD_TOPIC`
    """)
    return [r["LABEL"] for r in rows if r.get("LABEL")]


@lru_cache(maxsize=1)
def _get_companies():
    rows = query_bq("""
        SELECT NAME
        FROM `adex-5555.RATECARD_PROD.RATECARD_COMPANY`
    """)
    return [r["NAME"] for r in rows if r.get("NAME")]


# ============================================================
# MATCH HELPERS (AMÉLIORÉ)
# ============================================================

def _match_best(q: str, candidates):

    q_tokens = q.split()

    best_match = None
    best_score = 0

    for label in candidates:
        l = normalize(label)

        score = sum(1 for token in q_tokens if token in l)

        if score > best_score:
            best_score = score
            best_match = label

    return best_match if best_score > 0 else None


# ============================================================
# HARD OVERRIDES (EXTENDED)
# ============================================================

def _detect_topic_override(q: str):

    mapping = {
        "retail media": "Retail Media",
        "ctv": "CTV & VIDEO",
        "video": "CTV & VIDEO",
        "dooh": "DOOH",
        "search": "Search",
        "social": "Social",
        "audio": "Audio",
        "display": "Display",
        "retail data": "Retail Data",
        "marketplace": "Marketplaces",
        "agent": "Agentic Commerce",
        "ia": "Agentic Commerce",
        "ai": "Agentic Commerce",
    }

    for key, value in mapping.items():
        if key in q:
            return value

    return None


# ============================================================
# MAIN RESOLVER
# ============================================================

def resolve_entity(query: str):

    q = normalize(query)

    # --------------------------------------------------
    # 🔴 PRIORITÉ 1 → COMPANY
    # --------------------------------------------------

    companies = _get_companies()
    company_match = _match_best(q, companies)

    if company_match:
        return {
            "type": "company",
            "label": company_match
        }

    # --------------------------------------------------
    # 🔵 PRIORITÉ 2 → HARD TOPIC
    # --------------------------------------------------

    override = _detect_topic_override(q)

    if override:
        return {
            "type": "topic",
            "label": override
        }

    # --------------------------------------------------
    # 🔵 PRIORITÉ 3 → TOPIC DYNAMIQUE
    # --------------------------------------------------

    topics = _get_topics()
    topic_match = _match_best(q, topics)

    if topic_match:
        return {
            "type": "topic",
            "label": topic_match
        }

    # --------------------------------------------------
    # ⚪ FALLBACK
    # --------------------------------------------------

    return {
        "type": "unknown",
        "label": None
    }
