from typing import List, Dict
from google.cloud import bigquery

import re

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, get_bigquery_client
from api.matching.models import CompanyMatch


TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_ALIAS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY_ALIAS"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


# ===============================================
# NORMALISATION
# ===============================================

def normalize(text: str) -> str:

    if not text:
        return ""

    text = text.upper()

    text = re.sub(r"\(.*?\)", "", text)

    text = re.sub(r"[^A-Z0-9 ]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ===============================================
# LIST UNMATCHED COMPANIES
# ===============================================

def list_unmatched_companies() -> List[Dict]:

    sql = f"""
    SELECT
        company,
        COUNT(*) AS count
    FROM `{TABLE_CONTENT}`,
    UNNEST(ACTEURS_CITES) AS company
    WHERE company IS NOT NULL
    AND TRIM(company) != ""
    GROUP BY company
    ORDER BY count DESC
    """

    rows = query_bq(sql)

    client = get_bigquery_client()

    # récupérer alias existants
    alias_query = f"""
    SELECT ALIAS
    FROM `{TABLE_ALIAS}`
    """

    alias_rows = client.query(alias_query).result()

    alias_set = {
        normalize(row["ALIAS"])
        for row in alias_rows
        if row["ALIAS"]
    }

    # récupérer sociétés existantes
    company_query = f"""
    SELECT NAME
    FROM `{TABLE_COMPANY}`
    """

    company_rows = client.query(company_query).result()

    company_set = {
        normalize(row["NAME"])
        for row in company_rows
        if row["NAME"]
    }

    results = []

    for r in rows:

        raw = r["company"]

        if not raw:
            continue

        norm = normalize(raw)

        # exclure alias déjà existants
        if norm in alias_set:
            continue

        # exclure sociétés déjà existantes
        if norm in company_set:
            continue

        results.append({
            "value": raw,
            "count": r["count"],
        })

    return results


# ===============================================
# MATCH COMPANY
# ===============================================

def match_company(data: CompanyMatch):

    # IGNORE → on ne fait rien
    if data.action == "IGNORE":
        return

    if data.action != "MATCH":
        raise ValueError("Action inconnue")

    if not data.id_company:
        raise ValueError("id_company obligatoire")

    client = get_bigquery_client()

    alias = data.alias.strip()

    sql = f"""
    INSERT INTO `{TABLE_ALIAS}`
    (ALIAS, ID_COMPANY)
    VALUES (@alias, @id_company)
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("alias", "STRING", alias),
            bigquery.ScalarQueryParameter("id_company", "STRING", data.id_company),
        ]
    )

    client.query(sql, job_config=job_config).result()

    client.query(sql, job_config=job_config).result()
