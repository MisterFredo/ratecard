from typing import List, Dict
from google.cloud import bigquery

import re

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, get_bigquery_client
from api.matching.models import SolutionMatch


TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_ALIAS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION_ALIAS"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"


# ===============================================
# NORMALISATION
# ===============================================

def normalize(text: str) -> str:

    if not text:
        return ""

    text = text.upper()

    text = re.sub(r"\(.*?\)", "", text)

    text = text.replace("+", " PLUS ")

    text = re.sub(r"[^A-Z0-9 ]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ===============================================
# LIST UNMATCHED SOLUTIONS
# ===============================================

def list_unmatched_solutions() -> List[Dict]:

    sql = f"""
    SELECT
        solution,
        COUNT(*) AS count
    FROM `{TABLE_CONTENT}`,
    UNNEST(SOLUTIONS_LLM) AS solution
    WHERE solution IS NOT NULL
    AND TRIM(solution) != ""
    GROUP BY solution
    ORDER BY count DESC
    """

    rows = query_bq(sql)

    client = get_bigquery_client()

    # récupérer alias existants
    alias_rows = client.query(
        f"""
        SELECT ALIAS
        FROM `{TABLE_ALIAS}`
        """
    ).to_dataframe()

    alias_set = {
        normalize(a)
        for a in alias_rows["ALIAS"].tolist()
        if a
    }

    # récupérer solutions existantes
    solution_rows = client.query(
        f"""
        SELECT NAME
        FROM `{TABLE_SOLUTION}`
        """
    ).to_dataframe()

    solution_set = {
        normalize(s)
        for s in solution_rows["NAME"].tolist()
        if s
    }

    results = []

    for r in rows:

        raw = r["solution"]

        if not raw:
            continue

        norm = normalize(raw)

        if norm in alias_set:
            continue

        if norm in solution_set:
            continue

        results.append({
            "value": raw,
            "count": r["count"],
        })

    return results


# ===============================================
# MATCH SOLUTION
# ===============================================

def match_solution(data: SolutionMatch):

    if data.action != "MATCH":
        raise ValueError("Action inconnue")

    if not data.id_solution:
        raise ValueError("id_solution obligatoire")

    client = get_bigquery_client()

    alias = data.alias.strip()

    sql = f"""
    INSERT INTO `{TABLE_ALIAS}`
    (ALIAS, ID_SOLUTION)
    VALUES (@alias, @id_solution)
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("alias", "STRING", alias),
            bigquery.ScalarQueryParameter("id_solution", "STRING", data.id_solution),
        ]
    )

    client.query(sql, job_config=job_config).result()
