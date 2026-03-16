from utils.bigquery_utils import query_bq, get_bigquery_client
from api.matching.models import SolutionMatch
from google.cloud import bigquery


BQ_PROJECT = "adex-5555"
BQ_DATASET = "RATECARD_PROD"

TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_ALIAS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION_ALIAS"
TABLE_IGNORE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_ALIAS_IGNORE"


# ===============================================
# LIST UNMATCHED SOLUTIONS
# ===============================================

def list_unmatched_solutions():

    sql = f"""
    WITH parsed AS (

        SELECT
            TRIM(solution_llm) AS solution_llm

        FROM `{TABLE_CONTENT}`,

        UNNEST(
            SPLIT(
                REGEXP_REPLACE(IFNULL(SOLUTIONS_LLM,''), r'[\\[\\]\"]', ''),
                ','
            )
        ) AS solution_llm

    )

    SELECT
        solution_llm,
        COUNT(*) AS count

    FROM parsed

    LEFT JOIN `{TABLE_ALIAS}` a
        ON UPPER(parsed.solution_llm) = UPPER(a.ALIAS)

    LEFT JOIN `{TABLE_IGNORE}` i
        ON UPPER(parsed.solution_llm) = UPPER(i.ALIAS)
        AND i.TYPE = 'SOLUTION'

    WHERE
        parsed.solution_llm != ''
        AND a.ALIAS IS NULL
        AND i.ALIAS IS NULL

    GROUP BY solution_llm
    ORDER BY count DESC
    """

    rows = query_bq(sql)

    return [
        {
            "value": r["solution_llm"],
            "count": r["count"],
        }
        for r in rows
    ]


# ===============================================
# MATCH SOLUTION
# ===============================================

def match_solution(data: SolutionMatch):

    client = get_bigquery_client()

    alias = data.alias.strip()

    if data.action == "MATCH":

        if not data.id_solution:
            raise ValueError("id_solution obligatoire pour MATCH")

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

        return


    if data.action == "IGNORE":

        sql = f"""
        INSERT INTO `{TABLE_IGNORE}`
        (ALIAS, TYPE)
        VALUES (@alias, 'SOLUTION')
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("alias", "STRING", alias),
            ]
        )

        client.query(sql, job_config=job_config).result()

        return


    raise ValueError("Action inconnue")
