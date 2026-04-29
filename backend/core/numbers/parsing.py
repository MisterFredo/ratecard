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
# PARSE CHIFFRES
# ============================================================

def parse_chiffres(chiffres: List[str]) -> List[Dict]:

    results = []

    for line in chiffres:

        if not line or "|" not in line:
            continue

        parts = [p.strip() for p in line.split("|")]

        if len(parts) == 6:
            label, value, unit_raw, actor, market, period = parts
            type_ = None

        elif len(parts) == 7:
            label, value, unit_raw, actor, market, period, type_ = parts

        else:
            continue

        # ============================================================
        # VALUE (robuste)
        # ============================================================

        try:
            value = str(value).replace(",", ".").replace(" ", "")
            value = float(value)
        except:
            continue

        # ============================================================
        # UNIT
        # ============================================================

        unit, scale = _extract_unit_scale(unit_raw)

        # ============================================================
        # TYPE CLEAN
        # ============================================================

        type_clean = type_.strip() if isinstance(type_, str) else None

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
            "type": type_clean,
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
