import uuid
import json

from datetime import datetime, timezone
from typing import List, Dict
from google.cloud import bigquery
from openai import OpenAI

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, get_bigquery_client

client = OpenAI()

TABLE = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NUMBERS"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"


# ============================================================
# HELPERS
# ============================================================

def _now():
    return datetime.now(timezone.utc).isoformat()


def _map_row(r: Dict) -> Dict:
    return {
        "id_insight": r["ID_INSIGHT"],
        "entity_type": r["ENTITY_TYPE"],
        "entity_id": r["ENTITY_ID"],
        "year": r["YEAR"],
        "period": r["PERIOD"],
        "frequency": r["FREQUENCY"],
        "metrics": r.get("METRICS") or [],
        "status": r["STATUS"],
        "created_at": r["CREATED_AT"],
        "updated_at": r["UPDATED_AT"],
        "date_key": f"{r['YEAR']}-{r['PERIOD']}",
    }


# ============================================================
# CREATE
# ============================================================

def create_numbers_insight(data: dict) -> str:

    insight_id = str(uuid.uuid4())
    now = _now()

    row = [{
        "ID_INSIGHT": insight_id,
        "ENTITY_TYPE": data.get("entity_type"),
        "ENTITY_ID": data.get("entity_id"),
        "YEAR": data.get("year"),
        "PERIOD": data.get("period"),
        "FREQUENCY": data.get("frequency"),
        "METRICS": data.get("metrics") or [],
        "STATUS": data.get("status", "DRAFT"),
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()

    job = client.load_table_from_json(
        row,
        TABLE,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    )

    job.result()

    return insight_id


# ============================================================
# GET / LIST
# ============================================================

def get_numbers(entity_type, entity_id, year, period, frequency):

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND PERIOD = @period
        AND FREQUENCY = @frequency
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
    })

    return _map_row(rows[0]) if rows else None


def list_numbers_insights(entity_type, entity_id):

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        ORDER BY YEAR DESC, PERIOD DESC
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
    })

    return [_map_row(r) for r in rows]


# ============================================================
# UPDATE
# ============================================================

def update_numbers(entity_type, entity_id, year, period, frequency, status):

    query_bq(f"""
        UPDATE `{TABLE}`
        SET
            STATUS = @status,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND PERIOD = @period
        AND FREQUENCY = @frequency
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
        "status": status,
    })


# ============================================================
# CHECK EXISTING
# ============================================================

def numbers_exists(entity_type, entity_id, year, period, frequency):

    rows = query_bq(f"""
        SELECT 1
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        AND YEAR = @year
        AND PERIOD = @period
        AND FREQUENCY = @frequency
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
    })

    return len(rows) > 0


# ============================================================
# FETCH CHIFFRES (🔥 KEY)
# ============================================================

def _get_numbers_data(entity_type, entity_id, year, period, frequency):

    TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

    where_content = "FALSE"

    if entity_type == "topic":
        where_content = "EXISTS (SELECT 1 FROM UNNEST(c.topics) t WHERE t.id_topic = @entity_id)"

    elif entity_type == "company":
        where_content = "EXISTS (SELECT 1 FROM UNNEST(c.companies) comp WHERE comp.id_company = @entity_id)"

    elif entity_type == "solution":
        where_content = "EXISTS (SELECT 1 FROM UNNEST(c.solutions) s WHERE s.id_solution = @entity_id)"

    if frequency == "WEEKLY":
        date_filter = "EXTRACT(ISOWEEK FROM c.published_at) = @period"
    elif frequency == "QUARTERLY":
        date_filter = "EXTRACT(QUARTER FROM c.published_at) = @period"
    else:
        date_filter = "EXTRACT(MONTH FROM c.published_at) = @period"

    rows = query_bq(f"""
        SELECT chiffre
        FROM `{TABLE_CONTENT}` c,
        UNNEST(c.CHIFFRES) AS chiffre
        WHERE {where_content}
        AND EXTRACT(YEAR FROM c.published_at) = @year
        AND {date_filter}
    """, {
        "entity_id": entity_id,
        "year": year,
        "period": period,
    })

    return [r["chiffre"] for r in rows if r.get("chiffre")]


# ============================================================
# PROMPT (CONSOLIDATION)
# ============================================================

def _build_prompt(chiffres, year, period, frequency):

    chiffres_str = "\n".join([f"- {c}" for c in chiffres[:300]])

    if frequency == "WEEKLY":
        period_label = f"Semaine {period} - {year}"
    elif frequency == "QUARTERLY":
        period_label = f"Trimestre {period} - {year}"
    else:
        period_label = f"Mois {period} - {year}"

    return f"""
Tu es un analyste data senior spécialisé en marketing, retail media et adtech.

Ton rôle est de transformer une liste brute de chiffres en indicateurs fiables et exploitables.

=====================
PÉRIODE ANALYSÉE
=====================
{period_label}

=====================
CHIFFRES BRUTS
=====================
{chiffres_str}

=====================
MISSION
=====================
À partir de ces chiffres :

1. Regroupe les chiffres similaires (même métrique, même logique)
2. Ignore les valeurs isolées ou non représentatives
3. Identifie les fourchettes réalistes quand il y a divergence
4. Déduis une valeur centrale (médiane ou consensus)
5. Évalue la robustesse du signal

=====================
RÈGLES STRICTES
=====================

- Maximum 5 metrics
- Chaque metric doit représenter une réalité marché (pas un cas isolé)

- Regroupement obligatoire :
  → CPM, budgets, croissance, part de marché, etc.

- Si plusieurs valeurs proches :
  → calcule une fourchette + valeur centrale

- Si valeurs contradictoires :
  → indique une range large + confidence faible

- Ignore :
  → chiffres uniques non corroborés
  → chiffres trop spécifiques (ex: un seul acteur)

- Chaque metric doit contenir :

  • label → nom clair (ex: "CPM retail media")
  • value → valeur représentative (ex: "25€")
  • range → fourchette (ex: "20€ - 30€")
  • confidence → HIGH / MEDIUM / LOW
  • sources → nombre de chiffres utilisés

=====================
STYLE
=====================

- factuel
- synthétique
- orienté décision
- aucune paraphrase

=====================
FORMAT DE SORTIE (JSON STRICT)
=====================

{{
  "metrics": [
    {{
      "label": "...",
      "value": "...",
      "range": "...",
      "confidence": "...",
      "sources": 0
    }}
  ]
}}
"""

# ============================================================
# GENERATE
# ============================================================

def generate_numbers(entity_type, entity_id, year, period, frequency, force=False):

    if not force and numbers_exists(entity_type, entity_id, year, period, frequency):
        return {"status": "exists"}

    chiffres = _get_numbers_data(entity_type, entity_id, year, period, frequency)

    if not chiffres:
        return {"status": "no_content"}

    prompt = _build_prompt(chiffres, year, period, frequency)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )

    raw = response.choices[0].message.content

    try:
        metrics = json.loads(raw).get("metrics", [])
    except Exception:
        return {"status": "error", "raw": raw}

    insight_id = create_numbers_insight({
        "entity_type": entity_type,
        "entity_id": entity_id,
        "year": year,
        "period": period,
        "frequency": frequency,
        "metrics": metrics,
        "status": "GENERATED",
    })

    return {
        "status": "ok",
        "id_insight": insight_id,
        "metrics": metrics,
    }


# ============================================================
# DELETE
# ============================================================

def delete_numbers_insight(insight_id: str):

    query_bq(f"""
        DELETE FROM `{TABLE}`
        WHERE ID_INSIGHT = @insight_id
    """, {
        "insight_id": insight_id
    })

def list_numbers_status(entity_type, frequency, year):

    table = f"{BQ_PROJECT}.{BQ_DATASET}.V_NUMBERS_STATUS"

    rows = query_bq(f"""
        SELECT
            entity_type,
            entity_id,
            entity_name,
            year,
            period,
            frequency,
            nb_numbers,
            numbers_status
        FROM `{table}`
        WHERE entity_type = @entity_type
        AND frequency = @frequency
        AND year = @year
        ORDER BY
            CASE WHEN numbers_status = "MISSING" THEN 0 ELSE 1 END,
            nb_numbers DESC
    """, {
        "entity_type": entity_type,
        "frequency": frequency,
        "year": year,
    })

    return [
        {
            "entity_type": r["entity_type"],
            "entity_id": r["entity_id"],
            "entity_name": r.get("entity_name"),
            "year": r["year"],
            "period": r["period"],
            "frequency": r["frequency"],
            "nb_numbers": r["nb_numbers"],
            "numbers_status": r["numbers_status"],
        }
        for r in rows
    ]


# ============================================================
# GET BY ID
# ============================================================

def get_numbers_by_id(insight_id: str):

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ID_INSIGHT = @insight_id
        LIMIT 1
    """, {
        "insight_id": insight_id
    })

    return _map_row(rows[0]) if rows else None


# ============================================================
# LATEST
# ============================================================

def get_latest_numbers(entity_type, entity_id):

    rows = query_bq(f"""
        SELECT *
        FROM `{TABLE}`
        WHERE ENTITY_TYPE = @entity_type
        AND ENTITY_ID = @entity_id
        ORDER BY YEAR DESC, PERIOD DESC
        LIMIT 1
    """, {
        "entity_type": entity_type,
        "entity_id": entity_id,
    })

    return _map_row(rows[0]) if rows else None
