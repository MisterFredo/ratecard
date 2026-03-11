import re
import uuid
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone, date
from typing import Optional, Dict, Any, List
from urllib.parse import urljoin

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

    text = text.replace("\r\n", "\n")

    blocs = re.split(r"\n?\s*TITLE\s*:", text)

    print(f"[RAW_IMPORT] Nombre de blocs détectés : {len(blocs)-1}")

    results = []

    for i, bloc in enumerate(blocs[1:], start=1):

        bloc = bloc.strip()

        try:

            lines = bloc.split("\n")

            # -------------------------
            # TITLE
            # -------------------------

            title = lines[0].strip()

            # -------------------------
            # DATE_SOURCE
            # -------------------------

            date_source = None

            date_match = re.search(
                r"DATE_SOURCE\s*:\s*(.+)",
                bloc
            )

            if date_match:
                date_str = date_match.group(1).strip()

                try:
                    date_source = parse_date_fr(date_str)
                except Exception:
                    print(f"[RAW_IMPORT] Bloc #{i} date invalide : {date_str}")

            # -------------------------
            # RAW_TEXT
            # -------------------------

            raw_text = bloc

            raw_text = raw_text.replace(title, "", 1)

            raw_text = re.sub(r"RAW_TEXT\s*:", "", raw_text)
            raw_text = re.sub(r"DATE_SOURCE\s*:\s*.+", "", raw_text)

            raw_text = raw_text.strip()

            if not raw_text:
                print(f"[RAW_IMPORT] Bloc #{i} vide")
                continue

            results.append({
                "TITLE": title,
                "DATE_SOURCE": date_source,
                "RAW_TEXT": raw_text
            })

        except Exception as e:

            print(f"[RAW_IMPORT] Bloc #{i} erreur : {e}")

    print(f"[RAW_IMPORT] Blocs valides : {len(results)}")

    return results


# ============================================================
# INSERT BIGQUERY
# ============================================================

def insert_raw_rows(rows: List[Dict], id_source: str):

    print("[RAW_IMPORT] Début insertion BigQuery")

    client = get_bigquery_client()

    table_id = f"{BQ_PROJECT}.{BQ_DATASET}.{TABLE}"

    payload = []

    for r in rows:

        payload.append(
            {
                "ID_RAW": str(uuid.uuid4()),
                "CREATED_AT": datetime.utcnow(),
                "STATUS": "STORED",

                "SOURCE_TITLE": r["TITLE"],
                "DATE_SOURCE": r["DATE_SOURCE"],
                "RAW_TEXT": r["RAW_TEXT"],
                "SOURCE_ID": id_source,
            }
        )

    print(f"[RAW_IMPORT] Nombre de lignes à insérer : {len(payload)}")

    import pandas as pd
    from google.cloud import bigquery

    df = pd.DataFrame(payload)

    job_config = bigquery.LoadJobConfig(
        write_disposition="WRITE_APPEND"
    )

    job = client.load_table_from_dataframe(
        df,
        table_id,
        job_config=job_config
    )

    job.result()

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
