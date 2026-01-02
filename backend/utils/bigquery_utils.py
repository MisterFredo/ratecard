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
    Crée un client BigQuery dans la région correcte.
    """
    credentials_path = os.environ.get("GOOGLE_CREDENTIALS_FILE")

    if credentials_path:
        with open(credentials_path, "r") as f:
            info = json.load(f)
        credentials = service_account.Credentials.from_service_account_info(info)
        project_id = info.get("project_id")
        return bigquery.Client(
            credentials=credentials,
            project=project_id,
            location="EU"   # 🔥 FORCE LA RÉGION CORRECTE
        )

    # Local dev ou ADC
    return bigquery.Client(location="EU")




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
# Insertion BigQuery (INSERT SQL, PAS de streaming)
# ---------------------------------------------------------
def insert_bq(table: str, rows: list[dict]):
    """
    Insère des lignes dans une table BigQuery via INSERT SQL
    (évite le streaming buffer pour permettre UPDATE immédiat).
    """
    client = get_bigquery_client()

    for row in rows:
        columns = []
        placeholders = []
        params = []

        for key, value in row.items():
            columns.append(key)
            placeholders.append(f"@{key}")

            # Conversion datetime/date propre
            if hasattr(value, "isoformat"):
                value = value.isoformat()

            params.append(
                bigquery.ScalarQueryParameter(
                    key,
                    _infer_type(value),
                    value
                )
            )

        sql = f"""
            INSERT INTO `{table}` ({", ".join(columns)})
            VALUES ({", ".join(placeholders)})
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=params
        )

        client.query(sql, job_config=job_config).result()
