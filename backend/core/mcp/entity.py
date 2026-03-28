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

    # --------------------------------------------------
    # 🔵 TOPICS (hardcoded)
    # --------------------------------------------------

    if "retail media" in q:
        return {"type": "topic", "label": "Retail Media"}

    if "ctv" in q or "video" in q:
        return {"type": "topic", "label": "CTV & VIDEO"}

    if "dooh" in q:
        return {"type": "topic", "label": "DOOH"}

    # --------------------------------------------------
    # 🟢 COMPANY (DYNAMIQUE BQ)
    # --------------------------------------------------

    rows = query_bq("""
        SELECT NAME
        FROM `adex-5555.RATECARD_PROD.RATECARD_COMPANY`
    """)

    for r in rows:
        name = r["NAME"]
        if name and normalize(name) in q:
            return {
                "type": "company",
                "label": name
            }

    # --------------------------------------------------
    # 🔴 FALLBACK
    # --------------------------------------------------

    return {
        "type": "unknown",
        "label": None
    }

