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

    # récupérer solutions existantes
    solution_query = f"""
    SELECT NAME
    FROM `{TABLE_SOLUTION}`
    """

    solution_rows = client.query(solution_query).result()

    solution_set = {
        normalize(row["NAME"])
        for row in solution_rows
        if row["NAME"]
    }

    results = []

    for r in rows:

        raw = r["solution"]

        if not raw:
            continue

        norm = normalize(raw)

        # exclure alias déjà existants
        if norm in alias_set:
            continue

        # exclure solutions déjà existantes
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

    if data.action == "IGNORE":
        return

    if data.action != "MATCH":
        raise ValueError("Action inconnue")

    if not data.id_solution:
        raise ValueError("id_solution obligatoire")

    client = get_bigquery_client()

    alias = data.alias.strip()

    # 1️⃣ enregistrer alias

    sql_alias = f"""
    INSERT INTO `{TABLE_ALIAS}`
    (ALIAS, ID_SOLUTION)
    VALUES (@alias, @id_solution)
    """

    job_config_alias = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("alias", "STRING", alias),
            bigquery.ScalarQueryParameter("id_solution", "STRING", data.id_solution),
        ]
    )

    client.query(sql_alias, job_config=job_config_alias).result()

    # 2️⃣ créer relations contenu → solution

    sql_relation = f"""
    INSERT INTO `{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_SOLUTION`
    (ID_CONTENT, ID_SOLUTION)

    SELECT
        c.ID_CONTENT,
        @id_solution
    FROM `{TABLE_CONTENT}` c,
    UNNEST(c.SOLUTIONS_LLM) AS solution
    WHERE UPPER(TRIM(solution)) = UPPER(@alias)
    """

    job_config_relation = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("alias", "STRING", alias),
            bigquery.ScalarQueryParameter("id_solution", "STRING", data.id_solution),
        ]
    )

    client.query(sql_relation, job_config=job_config_relation).result()
