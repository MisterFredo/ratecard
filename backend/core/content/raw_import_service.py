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

    print(f"[RAW_IMPORT] Parsing date : {date_str}")

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
        raise ValueError(f"[RAW_IMPORT] Format date invalide : {date_str}")

    jour = int(parts[0])
    mois_num = mois[parts[1].lower()]
    annee = int(parts[2])

    parsed = datetime(annee, mois_num, jour).date()

    print(f"[RAW_IMPORT] Date parsed : {parsed}")

    return parsed


# ============================================================
# PARSE RAW FILE
# ============================================================

def parse_raw_blocks(text: str) -> List[Dict]:

    print("[RAW_IMPORT] Début parsing fichier")

    blocs = text.split("TITLE :")

    print(f"[RAW_IMPORT] Nombre de blocs détectés (brut) : {len(blocs)-1}")

    results = []

    for i, bloc in enumerate(blocs[1:], start=1):

        bloc = bloc.strip()

        print(f"[RAW_IMPORT] Analyse bloc #{i}")

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        title_match = re.search(r"^(.*?)\n", bloc)

        if not title_match:
            print(f"[RAW_IMPORT] Bloc #{i} ignoré (pas de title)")
            continue

        title = title_match.group(1).strip()

        print(f"[RAW_IMPORT] Title détecté : {title[:80]}")

        # ----------------------------------------------------
        # RAW TEXT 1
        # ----------------------------------------------------

        raw1_match = re.search(r"RAW_TEXT\s*:(.*?)DATE_SOURCE", bloc, re.S)

        raw1 = raw1_match.group(1).strip() if raw1_match else ""

        print(f"[RAW_IMPORT] RAW_TEXT_1 length : {len(raw1)}")

        # ----------------------------------------------------
        # DATE
        # ----------------------------------------------------

        date_match = re.search(r"DATE_SOURCE\s*:(.*?)\n", bloc)

        if not date_match:
            print(f"[RAW_IMPORT] Bloc #{i} ignoré (pas de DATE_SOURCE)")
            continue

        date_source_str = date_match.group(1).strip()

        try:
            date_source = parse_date_fr(date_source_str)
        except Exception as e:
            print(f"[RAW_IMPORT] Erreur parsing date bloc #{i} : {e}")
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

        print(f"[RAW_IMPORT] RAW_TEXT_2 length : {len(raw2)}")

        # ----------------------------------------------------
        # FINAL TEXT
        # ----------------------------------------------------

        raw_text = f"{raw1}\n\n{raw2}".strip()

        print(f"[RAW_IMPORT] RAW_TEXT final length : {len(raw_text)}")

        results.append(
            {
                "TITLE": title,
                "DATE_SOURCE": date_source,
                "RAW_TEXT": raw_text,
            }
        )

    print(f"[RAW_IMPORT] Blocs valides : {len(results)}")

    return results


# ============================================================
# INSERT BIGQUERY
# ============================================================

def insert_raw_rows(rows: List[Dict], id_source: str):

    print("[RAW_IMPORT] Début insertion BigQuery")

    client = get_bigquery_client()

    table_id = f"{BQ_PROJECT}.{BQ_DATASET}.{TABLE}"

    print(f"[RAW_IMPORT] Table cible : {table_id}")

    payload = []

    for r in rows:

        payload.append(
            {
                "TITLE": r["TITLE"],
                "DATE_SOURCE": r["DATE_SOURCE"].isoformat(),
                "RAW_TEXT": r["RAW_TEXT"],
                "SOURCE_ID": id_source,
            }
        )

    print(f"[RAW_IMPORT] Nombre de lignes à insérer : {len(payload)}")

    errors = client.insert_rows_json(table_id, payload)

    if errors:
        print(f"[RAW_IMPORT] Erreurs BigQuery : {errors}")
        raise Exception(errors)

    print("[RAW_IMPORT] Insertion BigQuery OK")

    return len(payload)


# ============================================================
# MAIN SERVICE
# ============================================================

def import_raw_content(text: str, id_source: str):

    print("[RAW_IMPORT] ===== START IMPORT =====")

    rows = parse_raw_blocks(text)

    if not rows:
        raise Exception("[RAW_IMPORT] Aucun bloc détecté dans le fichier")

    inserted = insert_raw_rows(rows, id_source)

    print(f"[RAW_IMPORT] Import terminé : {inserted} lignes")

    print("[RAW_IMPORT] ===== END IMPORT =====")

    return inserted
