from typing import List, Dict
from google.cloud import bigquery

import re
import uuid

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
    UNNEST(COMPANIES_LLM) AS company
    WHERE company IS NOT NULL
    AND TRIM(company) != ""
    GROUP BY company
    ORDER BY count DESC
    """

    rows = query_bq(sql)

    client = get_bigquery_client()

    alias_rows = client.query(
        f"""
        SELECT ALIAS
        FROM `{TABLE_ALIAS}`
        """
    ).to_dataframe()

    alias_set = {
        normalize(a)
        for a in alias_rows["ALIAS"].tolist()
    }

    company_rows = client.query(
        f"""
        SELECT NAME
        FROM `{TABLE_COMPANY}`
        """
    ).to_dataframe()

    company_set = {
        normalize(c)
        for c in company_rows["NAME"].tolist()
    }

    results = []

    for r in rows:

        raw = r["company"]
        norm = normalize(raw)

        if norm in alias_set:
            continue

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

    client = get_bigquery_client()

    alias = data.alias.strip()

    if data.action == "MATCH":

        if not data.id_company:
            raise ValueError("id_company obligatoire")

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

        return


    if data.action == "CREATE":

        id_company = str(uuid.uuid4())

        sql = f"""
        INSERT INTO `{TABLE_COMPANY}`
        (ID_COMPANY, NAME, STATUS)
        VALUES (@id_company, @name, 'ACTIVE')
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("id_company", "STRING", id_company),
                bigquery.ScalarQueryParameter("name", "STRING", alias),
            ]
        )

        client.query(sql, job_config=job_config).result()

        sql_alias = f"""
        INSERT INTO `{TABLE_ALIAS}`
        (ALIAS, ID_COMPANY)
        VALUES (@alias, @id_company)
        """

        job_config_alias = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("alias", "STRING", alias),
                bigquery.ScalarQueryParameter("id_company", "STRING", id_company),
            ]
        )

        client.query(sql_alias, job_config=job_config_alias).result()

        return


    if data.action == "IGNORE":
        return


    raise ValueError("Action inconnue")
