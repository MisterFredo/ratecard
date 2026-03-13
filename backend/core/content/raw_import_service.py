import re
import uuid
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone, date
from dateutil.parser import parse
from typing import Optional, Dict, Any, List
from urllib.parse import urljoin

from utils.bigquery_utils import get_bigquery_client
from config import BQ_PROJECT, BQ_DATASET


# ============================================================
# CONFIG
# ============================================================

TABLE = "RATECARD_CONTENT_RAW"

# ============================================================
# SCRAPING CONFIG
# ============================================================

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

def clean_raw_file(text: str) -> str:

    """
    Nettoie le fichier brut avant parsing.

    Objectif final pour chaque bloc :

    TITLE :
    DATE_SOURCE :
    RAW_TEXT :
    """

    import re

    text = text.replace("\r\n", "\n")

    blocs = re.split(r"\n?\s*TITLE\s*:", text)

    cleaned_blocks = []

    for bloc in blocs[1:]:

        bloc = bloc.strip()

        if not bloc:
            continue

        lines = bloc.split("\n")

        title = lines[0].strip()

        # -----------------------------
        # DATE_SOURCE
        # -----------------------------

        date_match = re.search(
            r"DATE_SOURCE\s*:\s*([^\n]+)",
            bloc
        )

        date_line = ""

        if date_match:
            date_line = f"DATE_SOURCE : {date_match.group(1).strip()}"

        # -----------------------------
        # RAW TEXT (fusion)
        # -----------------------------

        raw_text = bloc

        raw_text = raw_text.replace(title, "", 1)

        raw_text = re.sub(r"DATE_SOURCE\s*:\s*[^\n]+", "", raw_text)

        raw_text = re.sub(r"RAW_TEXT\s*:", "", raw_text)

        # suppression séparateurs
        raw_text = raw_text.replace("________________", "")

        # nettoyage espaces
        raw_text = re.sub(r"\n{3,}", "\n\n", raw_text)

        raw_text = raw_text.strip()

        cleaned_block = f"""TITLE : {title}

{date_line}

RAW_TEXT :
{raw_text}
"""

        cleaned_blocks.append(cleaned_block.strip())

    return "\n\n".join(cleaned_blocks)

# ============================================================
# PARSE DATE (FR → ISO)
# ============================================================

def parse_date(date_str):

    try:
        return parse(date_str, dayfirst=True, fuzzy=True).date()
    except Exception:
        print("[RAW_IMPORT] date ignorée:", date_str)
        return None

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

    try:

        # nettoyage
        date_str = date_str.strip().lower()

        # suppression parasites éventuels
        date_str = re.sub(r"[–\-].*$", "", date_str)
        date_str = date_str.replace("  ", " ")

        parts = date_str.split()

        if len(parts) < 3:
            return None

        jour = int(parts[0])
        mois_num = mois.get(parts[1])
        annee = int(parts[2])

        if not mois_num:
            return None

        return datetime(annee, mois_num, jour).date()

    except Exception:

        print("[RAW_IMPORT] date ignorée:", date_str)

        return None
        
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

            if not lines:
                continue

            # --------------------------------
            # TITLE
            # --------------------------------

            title = lines[0].strip()

            # --------------------------------
            # DATE_SOURCE
            # --------------------------------

            date_source = None

            date_match = re.search(
                r"DATE_SOURCE\s*:\s*([^\n]+)",
                bloc
            )

            if date_match:

                date_str = date_match.group(1).strip()

                try:
                    date_source = parse_date_fr(date_str)
                except Exception:
                    print("[RAW_IMPORT] date non parsée:", date_str)

            # --------------------------------
            # RAW TEXT
            # --------------------------------

            raw_text = bloc

            raw_text = raw_text.replace(title, "", 1)

            raw_text = re.sub(r"DATE_SOURCE\s*:\s*[^\n]+", "", raw_text)

            raw_text = re.sub(r"RAW_TEXT\s*:", "", raw_text)

            raw_text = raw_text.strip()

            if not raw_text:
                print(f"[RAW_IMPORT] Bloc #{i} vide")
                continue

            results.append(
                {
                    "TITLE": title,
                    "DATE_SOURCE": date_source,
                    "RAW_TEXT": raw_text,
                }
            )

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
                "CREATED_AT": datetime.utcnow().isoformat(),
                "STATUS": "STORED",

                "SOURCE_TITLE": r["TITLE"],
                "DATE_SOURCE": r["DATE_SOURCE"].strftime("%Y-%m-%d") if r["DATE_SOURCE"] else None,
                "RAW_TEXT": r["RAW_TEXT"],
                "SOURCE_ID": id_source,
            }
        )

    print(f"[RAW_IMPORT] Nombre de lignes à insérer : {len(payload)}")

    from google.cloud import bigquery

    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition="WRITE_APPEND"
    )

    job = client.load_table_from_json(
        payload,
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

    # 1️⃣ nettoyage
    text = clean_raw_file(text)

    # 2️⃣ parsing
    rows = parse_raw_blocks(text)

    # 3️⃣ insertion BQ
    inserted = insert_raw_rows(rows, id_source)

    return inserted

def clean_urls(urls_text: str) -> List[str]:

    urls = list(
        {u.strip() for u in urls_text.split("\n") if u.strip()}
    )

    return urls

def url_already_exists(url: str) -> bool:

    client = get_bigquery_client()

    query = f"""
        SELECT 1
        FROM `{BQ_PROJECT}.{BQ_DATASET}.{TABLE}`
        WHERE SOURCE_URL = @url
        LIMIT 1
    """

    from google.cloud import bigquery

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("url", "STRING", url)
        ]
    )

    rows = list(client.query(query, job_config=job_config))

    return len(rows) > 0

def parse_article_from_url(url: str) -> Dict[str, Any]:

    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # TITLE
    title = soup.title.string.strip() if soup.title else "NO TITLE"

    # DATE (tentative)
    date_source = None

    meta_date = soup.find("meta", {"property": "article:published_time"})
    if meta_date and meta_date.get("content"):
        try:
            date_source = parse(meta_date["content"]).date()
        except Exception:
            pass

    # RAW TEXT
    paragraphs = soup.find_all("p")
    raw_text = "\n".join(p.get_text() for p in paragraphs).strip()

    if not raw_text:
        raise Exception("RAW_TEXT vide")

    return {
        "TITLE": title,
        "DATE_SOURCE": date_source,
        "RAW_TEXT": raw_text,
        "SOURCE_URL": url
    }

def import_urls_batch(urls_text: str, id_source: str):

    urls = clean_urls(urls_text)

    results = []
    inserted_rows = []

    print(f"[RAW_IMPORT_URL] URLs reçues : {len(urls)}")

    for i, url in enumerate(urls, start=1):

        try:

            print(f"[RAW_IMPORT_URL] ({i}/{len(urls)}) {url}")

            if url_already_exists(url):
                results.append({"url": url, "status": "SKIPPED"})
                continue

            parsed = parse_article_from_url(url)

            inserted_rows.append(
                {
                    "TITLE": parsed["TITLE"],
                    "DATE_SOURCE": parsed["DATE_SOURCE"],
                    "RAW_TEXT": parsed["RAW_TEXT"],
                }
            )

            results.append({"url": url, "status": "READY"})

            # délai sécurisé 7–12s
            import time, random
            time.sleep(random.uniform(7, 12))

        except Exception as e:

            print("[RAW_IMPORT_URL] erreur:", e)

            results.append({
                "url": url,
                "status": "ERROR",
                "error": str(e)
            })

    # insertion groupée
    if inserted_rows:
        inserted_count = insert_raw_rows(inserted_rows, id_source)
    else:
        inserted_count = 0

    return {
        "total": len(urls),
        "inserted": inserted_count,
        "details": results
    }
