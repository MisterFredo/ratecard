import re
from datetime import datetime
from typing import List, Dict

from utils.bigquery_utils import get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET


# ============================================================
# CONFIG
# ============================================================

TABLE = "RATECARD_CONTENT_RAW"


# ============================================================
# PARSE DATE (FR → ISO)
# ============================================================

def parse_date_fr(date_str: str):

    mois = {
        "janvier": 1,
        "février": 2,
        "mars": 3,
        "avril": 4,
        "mai": 5,
        "juin": 6,
        "juillet": 7,
        "août": 8,
        "septembre": 9,
        "octobre": 10,
        "novembre": 11,
        "décembre": 12,
    }

    parts = date_str.strip().split()

    if len(parts) != 3:
        raise ValueError(f"Format date invalide : {date_str}")

    jour = int(parts[0])
    mois_num = mois[parts[1].lower()]
    annee = int(parts[2])

    return datetime(annee, mois_num, jour).date()


# ============================================================
# PARSE RAW FILE
# ============================================================

def parse_raw_blocks(text: str) -> List[Dict]:

    blocs = text.split("TITLE :")

    results = []

    for bloc in blocs[1:]:

        bloc = bloc.strip()

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        title_match = re.search(r"^(.*?)\n", bloc)

        if not title_match:
            continue

        title = title_match.group(1).strip()

        # ----------------------------------------------------
        # RAW TEXT 1
        # ----------------------------------------------------

        raw1_match = re.search(r"RAW_TEXT\s*:(.*?)DATE_SOURCE", bloc, re.S)

        raw1 = raw1_match.group(1).strip() if raw1_match else ""

        # ----------------------------------------------------
        # DATE
        # ----------------------------------------------------

        date_match = re.search(r"DATE_SOURCE\s*:(.*?)\n", bloc)

        if not date_match:
            continue

        date_source_str = date_match.group(1).strip()

        try:
            date_source = parse_date_fr(date_source_str)
        except Exception:
            continue

        # ----------------------------------------------------
        # RAW TEXT 2
        # ----------------------------------------------------

        raw2_match = re.search(
            r"DATE_SOURCE\s*:.*?\n\s*RAW_TEXT\s*:(.*)",
            bloc,
            re.S,
        )

        raw2 = raw2_match.group(1).strip() if raw2_match else ""

        # ----------------------------------------------------
        # FINAL TEXT
        # ----------------------------------------------------

        raw_text = f"{raw1}\n\n{raw2}".strip()

        results.append(
            {
                "TITLE": title,
                "DATE_SOURCE": date_source,
                "RAW_TEXT": raw_text,
            }
        )

    return results


# ============================================================
# INSERT BIGQUERY
# ============================================================

def insert_raw_rows(rows: List[Dict], id_source: str):

    client = get_bigquery_client()

    table_id = f"{BQ_PROJECT}.{BQ_DATASET}.{TABLE}"

    payload = []

    for r in rows:

        payload.append(
            {
                "TITLE": r["TITLE"],
                "DATE_SOURCE": r["DATE_SOURCE"],
                "RAW_TEXT": r["RAW_TEXT"],
                "ID_SOURCE": id_source,
            }
        )

    errors = client.insert_rows_json(table_id, payload)

    if errors:
        raise Exception(errors)

    return len(payload)


# ============================================================
# MAIN SERVICE
# ============================================================

def import_raw_content(text: str, id_source: str):

    rows = parse_raw_blocks(text)

    if not rows:
        raise Exception("Aucun bloc détecté dans le fichier")

    inserted = insert_raw_rows(rows, id_source)

    return inserted
