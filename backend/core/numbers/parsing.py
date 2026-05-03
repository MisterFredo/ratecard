from typing import List, Dict
from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# UNIT / SCALE
# ============================================================

def _extract_unit_scale(unit_raw: str):

    u = (unit_raw or "").lower().strip()

    if "%" in u:
        return "PERCENT", None

    if "€" in u or "eur" in u:
        if "billion" in u or "milliard" in u:
            return "EUR", "billion"
        if "million" in u:
            return "EUR", "million"
        if "thousand" in u or "k" in u:
            return "EUR", "thousand"
        return "EUR", None

    # 🔥 fallback propre
    return (u.upper() if u else None), None


# ============================================================
# SPLIT ROBUSTE
# ============================================================

def _safe_split(line: str) -> List[str]:
    """
    Split robuste en 6 champs :
    LABEL | VALUE | UNIT | ACTOR | MARKET | PERIOD
    """

    parts = [p.strip() for p in line.replace('"', '').split("|")]

    # 🔥 on force 6 champs
    while len(parts) < 6:
        parts.append(None)

    return parts[:6]


# ============================================================
# VALUE CLEAN
# ============================================================

def _clean_value(value_raw: str):
    """
    Nettoyage robuste des valeurs :
    - convertit FR → float
    - ignore ranges et textes
    """

    if not value_raw:
        return None

    v = value_raw.strip().lower()

    # ❌ cas non exploitables
    if any(x in v for x in [" à ", "-", "entre", "from", "to"]):
        return None

    # 🔥 normalisation
    v = v.replace(",", ".")
    v = v.replace(" ", "")

    try:
        return float(v)
    except:
        return None


# ============================================================
# PARSE CHIFFRES
# ============================================================

def parse_chiffres(chiffres: List[str]) -> List[Dict]:

    results = []

    for line in chiffres:

        if not line or "|" not in line:
            continue

        # ============================================================
        # SPLIT
        # ============================================================

        label, value_raw, unit_raw, actor, market, period = _safe_split(line)

        # ============================================================
        # VALUE
        # ============================================================

        value = _clean_value(value_raw)

        # 🔥 skip si non exploitable
        if value is None:
            continue

        # ============================================================
        # UNIT
        # ============================================================

        unit, scale = _extract_unit_scale(unit_raw)

        # ============================================================
        # RESULT
        # ============================================================

        results.append({
            "label": label.strip() if label else None,
            "value": value,
            "unit": unit,
            "scale": scale,
            "actor": actor.strip() if actor else None,
            "zone": market.strip() if market else None,
            "period": period.strip() if period else None,
            "type": None,
        })

    return results


# ============================================================
# RAW NUMBERS
# ============================================================

def get_raw_numbers(limit: int = 200):

    TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

    rows = query_bq(f"""
        SELECT ID_CONTENT, CHIFFRES
        FROM `{TABLE_CONTENT}`
        WHERE CHIFFRES IS NOT NULL
        LIMIT @limit
    """, {"limit": limit})

    results = []

    for r in rows:

        chiffres = r.get("CHIFFRES") or []

        if isinstance(chiffres, str):
            chiffres = chiffres.split("\n")

        parsed_list = parse_chiffres(chiffres)

        for parsed in parsed_list:
            parsed["id_content"] = r["ID_CONTENT"]
            results.append(parsed)

    return results


# ============================================================
# FROM CONTENT
# ============================================================

def get_numbers_from_content(id_content: str):

    TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

    rows = query_bq(f"""
        SELECT CHIFFRES
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT = @id_content
        LIMIT 1
    """, {"id_content": id_content})

    if not rows:
        return []

    chiffres = rows[0].get("CHIFFRES") or []

    if isinstance(chiffres, str):
        chiffres = chiffres.split("\n")

    return parse_chiffres(chiffres)
