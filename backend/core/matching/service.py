from utils.bigquery_utils import query_bq, get_bigquery_client
from api.matching.models import SolutionMatch

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
    SELECT
        solution_llm,
        COUNT(*) as count
    FROM `{TABLE_CONTENT}`,
    UNNEST(SOLUTIONS_LLM) AS solution_llm

    LEFT JOIN `{TABLE_ALIAS}` a
    ON UPPER(TRIM(solution_llm)) = UPPER(TRIM(a.ALIAS))

    WHERE a.ALIAS IS NULL

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

        sql = f"""
        INSERT INTO `{TABLE_ALIAS}`
        (ALIAS, ID_SOLUTION)
        VALUES (@alias, @id_solution)
        """

        job_config = {
            "query_parameters": [
                {"name": "alias", "parameterType": {"type": "STRING"}, "parameterValue": {"value": alias}},
                {"name": "id_solution", "parameterType": {"type": "STRING"}, "parameterValue": {"value": data.id_solution}},
            ]
        }

        client.query(sql, job_config=job_config).result()

    elif data.action == "IGNORE":

        sql = f"""
        INSERT INTO `{TABLE_IGNORE}`
        (ALIAS, TYPE)
        VALUES (@alias, 'SOLUTION')
        """

        job_config = {
            "query_parameters": [
                {"name": "alias", "parameterType": {"type": "STRING"}, "parameterValue": {"value": alias}},
            ]
        }

        client.query(sql, job_config=job_config).result()

    else:
        raise ValueError("Action inconnue")
