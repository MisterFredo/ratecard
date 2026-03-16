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

    results = []

    for r in rows:

        if not r["solution"]:
            continue

        results.append({
            "value": r["solution"],
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
