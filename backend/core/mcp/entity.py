# core/mcp/entity.py

import unicodedata
from utils.bigquery_utils import query_bq


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


# ============================================================
# LOAD ENTITIES (CACHEABLE)
# ============================================================

def _get_topics():
    rows = query_bq("""
        SELECT LABEL
        FROM `adex-5555.RATECARD_PROD.RATECARD_TOPIC`
    """)
    return [r["LABEL"] for r in rows if r.get("LABEL")]


def _get_companies():
    rows = query_bq("""
        SELECT NAME
        FROM `adex-5555.RATECARD_PROD.RATECARD_COMPANY`
    """)
    return [r["NAME"] for r in rows if r.get("NAME")]


# ============================================================
# MATCH HELPERS
# ============================================================

def _match_topic(q: str, topics):
    for label in topics:
        if normalize(label) in q:
            return label
    return None


def _match_company(q: str, companies):
    for name in companies:
        if normalize(name) in q:
            return name
    return None


# ============================================================
# MAIN RESOLVER
# ============================================================

def resolve_entity(query: str):

    q = normalize(query)

    # --------------------------------------------------
    # 🔵 HARD OVERRIDES (prioritaires)
    # --------------------------------------------------

    if "retail media" in q:
        return {"type": "topic", "label": "Retail Media"}

    if "ctv" in q or "video" in q:
        return {"type": "topic", "label": "CTV & VIDEO"}

    if "dooh" in q:
        return {"type": "topic", "label": "DOOH"}

    # --------------------------------------------------
    # 🔵 TOPIC DYNAMIQUE
    # --------------------------------------------------

    topics = _get_topics()
    topic_match = _match_topic(q, topics)

    if topic_match:
        return {
            "type": "topic",
            "label": topic_match
        }

    # --------------------------------------------------
    # 🟢 COMPANY DYNAMIQUE
    # --------------------------------------------------

    companies = _get_companies()
    company_match = _match_company(q, companies)

    if company_match:
        return {
            "type": "company",
            "label": company_match
        }

    # --------------------------------------------------
    # 🔴 FALLBACK
    # --------------------------------------------------

    return {
        "type": "unknown",
        "label": None
    }
