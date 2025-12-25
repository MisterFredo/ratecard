# backend/utils/bigquery_utils.py

import os
import json
from datetime import datetime, date
from google.cloud import bigquery
from google.oauth2 import service_account


# ---------------------------------------------------------
# Client BigQuery (version minimaliste pour Ratecard)
# ---------------------------------------------------------
def get_bigquery_client() -> bigquery.Client:
    """
    Crée un client BigQuery.
    - Charge un fichier credentials JSON depuis GOOGLE_CREDENTIALS_FILE si défini.
    - Sinon fallback sur les Application Default Credentials (local / GCP).
    """

    credentials_path = os.environ.get("GOOGLE_CREDENTIALS_FILE")

    if credentials_path:
        # Render : fichier JSON monté via Secret File
        with open(credentials_path, "r") as f:
            info = json.load(f)
        credentials = service_account.Credentials.from_service_account_info(info)
        project_id = info.get("project_id")
        return bigquery.Client(credentials=credentials, project=project_id)

    # Local dev / ADC
    return bigquery.Client()


# ---------------------------------------------------------
# Helpers : inférer le type BigQuery standard
# ---------------------------------------------------------
def _infer_type(value):
    if isinstance(value, bool): return "BOOL"
    if isinstance(value, int): return "INT64"
    if isinstance(value, float): return "FLOAT64"
    if isinstance(value, datetime): return "TIMESTAMP"
    if isinstance(value, date): return "DATE"
    return "STRING"


# ---------------------------------------------------------
# Requête BigQuery (SELECT)
# ---------------------------------------------------------
def query_bq(sql: str, params: dict = None) -> list[dict]:
    """
    Exécute une requête SELECT sur BigQuery.
    params = {"nom": valeur} -> ScalarQueryParameter auto-générés.
    Retourne une liste de dictionnaires.
    """
    client = get_bigquery_client()

    job_config = None
    if params:
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter(name, _infer_type(value), value)
                for name, value in params.items()
            ]
        )

    job = client.query(sql, job_config=job_config)
    return [dict(row) for row in job.result()]


# ---------------------------------------------------------
# Insertion BigQuery (INSERT)
# ---------------------------------------------------------
def insert_bq(table: str, rows: list):
    """
    Insère des lignes dans une table BigQuery.
    rows = liste de dictionnaires Python.
    Convertit automatiquement les datetime en ISO.
    """
    client = get_bigquery_client()

    fixed = []
    for row in rows:
        clean = {}
        for k, v in row.items():
            if hasattr(v, "isoformat"):
                clean[k] = v.isoformat()
            else:
                clean[k] = v
        fixed.append(clean)

    errors = client.insert_rows_json(table, fixed)
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")
