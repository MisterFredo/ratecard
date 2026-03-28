# core/mcp/entity.py

import unicodedata

from utils.bigquery_utils import query_bq


# ============================================================
# NORMALIZE
# ============================================================

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


# ============================================================
# LOOKUP TOPIC
# ============================================================

def _match_topic(q: str):

    sql = """
    SELECT LABEL
    FROM `adex-5555.RATECARD_PROD.RATECARD_TOPIC`
    """

    rows = query_bq(sql)

    for r in rows:
        label = r["LABEL"]
        if normalize(label) in q:
            return label

    return None


# ============================================================
# LOOKUP COMPANY
# ============================================================

def _match_company(q: str):

    sql = """
    SELECT NAME
    FROM `adex-5555.RATECARD_PROD.RATECARD_COMPANY`
    """

    rows = query_bq(sql)

    for r in rows:
        name = r["NAME"]
        if normalize(name) in q:
            return name

    return None


# ============================================================
# MAIN RESOLVER
# ============================================================

def resolve_entity(query: str):

    q = normalize(query)

    # ----------------------------------------------------------
    # 1. TOPIC
    # ----------------------------------------------------------
    topic = _match_topic(q)

    if topic:
        return {
            "type": "topic",
            "label": topic
        }

    # ----------------------------------------------------------
    # 2. COMPANY
    # ----------------------------------------------------------
    company = _match_company(q)

    if company:
        return {
            "type": "company",
            "label": company
        }

    # ----------------------------------------------------------
    # 3. FALLBACK (IMPORTANT)
    # ----------------------------------------------------------
    return {
        "type": "unknown",
        "label": query  # 🔥 on garde le texte !
    }
