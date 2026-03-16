from typing import List, Dict, Any
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

def list_unmatched_solutions() -> List[Dict[str, Any]]:

    sql = f"""
    WITH extracted AS (

        SELECT
            TRIM(solution) AS solution

        FROM `{TABLE_CONTENT}`

        CROSS JOIN UNNEST(
            SPLIT(
                REGEXP_REPLACE(
                    COALESCE(SOLUTIONS_LLM,''),
                    r'[\\[\\]\"]',
                    ''
                ),
                ','
            )
        ) AS solution

    ),

    cleaned AS (

        SELECT solution
        FROM extracted
        WHERE solution IS NOT NULL
        AND solution != ''

    )

    SELECT
        solution AS solution_llm,
        COUNT(*) AS count

    FROM cleaned

    GROUP BY solution
    ORDER BY count DESC
    """

    rows = query_bq(sql)

    client = get_bigquery_client()

    # ---------------------------------
    # Solutions existantes
    # ---------------------------------

    solutions = client.query(
        f"""
        SELECT
            ID_SOLUTION,
            NAME
        FROM `{TABLE_SOLUTION}`
        """
    ).to_dataframe()

    solution_map = {
        normalize(r["NAME"]): {
            "id_solution": r["ID_SOLUTION"],
            "name": r["NAME"],
        }
        for _, r in solutions.iterrows()
    }

    # ---------------------------------
    # Alias existants
    # ---------------------------------

    aliases = client.query(
        f"""
        SELECT ALIAS
        FROM `{TABLE_ALIAS}`
        """
    ).to_dataframe()["ALIAS"].tolist()

    alias_set = {normalize(a) for a in aliases}

    # ---------------------------------
    # Build results
    # ---------------------------------

    results = []

    for r in rows:

        raw = r["solution_llm"]

        norm = normalize(raw)

        # déjà mappé
        if norm in alias_set:
            continue

        auto_match = None

        if norm in solution_map:
            auto_match = solution_map[norm]

        results.append({
            "value": raw,
            "count": r["count"],
            "auto_match": auto_match
        })

    return results


# ===============================================
# MATCH SOLUTION
# ===============================================

def match_solution(data: SolutionMatch):

    client = get_bigquery_client()

    alias = data.alias.strip()

    if data.action != "MATCH":
        raise ValueError("Action inconnue")

    if not data.id_solution:
        raise ValueError("id_solution obligatoire")

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
