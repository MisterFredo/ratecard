# core/mcp/entity.py

import unicodedata
from functools import lru_cache
from utils.bigquery_utils import query_bq


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text)\
        .encode("ascii", "ignore")\
        .decode("utf-8")\
        .lower()


# ============================================================
# CACHE (CRITIQUE)
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
# TOKEN MATCH (AMÉLIORÉ)
# ============================================================

def _token_match(q: str, candidates):

    q_tokens = set(q.split())

    best_match = None
    best_score = 0

    for c in candidates:
        c_norm = normalize(c)
        c_tokens = set(c_norm.split())

        score = len(q_tokens & c_tokens)

        # 🔥 score strict → évite faux positifs
        if score > best_score and score >= len(c_tokens):
            best_score = score
            best_match = c

    return best_match if best_score > 0 else None


# ============================================================
# MAIN RESOLVER
# ============================================================

def resolve_entity(query: str):

    q = normalize(query)

    # --------------------------------------------------
    # 🔵 HARD OVERRIDES (rapides et fiables)
    # --------------------------------------------------

    if "retail media" in q:
        return {"type": "topic", "label": "Retail Media"}

    if "ctv" in q or "video" in q:
        return {"type": "topic", "label": "CTV & VIDEO"}

    if "dooh" in q:
        return {"type": "topic", "label": "DOOH"}

    # --------------------------------------------------
    # 🟢 COMPANY FIRST (FIX CRITIQUE)
    # --------------------------------------------------

    companies = _get_companies()
    company_match = _token_match(q, companies)

    if company_match:
        return {
            "type": "company",
            "label": company_match
        }

    # --------------------------------------------------
    # 🔵 TOPIC MATCH
    # --------------------------------------------------

    topics = _get_topics()
    topic_match = _token_match(q, topics)

    if topic_match:
        return {
            "type": "topic",
            "label": topic_match
        }

    # --------------------------------------------------
    # 🔴 FALLBACK
    # --------------------------------------------------

    return {
        "type": "unknown",
        "label": None
    }
