# backend/core/synthesis/service.py

import uuid
from datetime import datetime, date
from typing import List, Dict
from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import get_bigquery_client, insert_bq, query_bq


# ============================================================
# TABLES
# ============================================================
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"

TABLE_SYNTHESIS_MODEL = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS_MODEL"
TABLE_SYNTHESIS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS"
TABLE_SYNTHESIS_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SYNTHESIS_CONTENT"


# ============================================================
# 1. LIST CANDIDATE CONTENTS
# ============================================================
def list_candidate_contents(
    topic_ids: List[str],
    company_ids: List[str],
    date_from: date,
    date_to: date,
) -> List[Dict]:
    """
    Liste des analyses candidates pour une synthèse (ADMIN).

    - inclut DRAFT + PUBLISHED
    - exclut ARCHIVED
    """

    client = get_bigquery_client()

    sql = f"""
    SELECT DISTINCT
      C.ID_CONTENT,
      C.ANGLE_TITLE,
      C.EXCERPT,
      C.CHIFFRES,
      C.CITATIONS,
      C.DATE_CREATION,
      C.PUBLISHED_AT
    FROM `{TABLE_CONTENT}` C

    LEFT JOIN `{TABLE_CONTENT_TOPIC}` CT
      ON C.ID_CONTENT = CT.ID_CONTENT
    LEFT JOIN `{TABLE_CONTENT_COMPANY}` CC
      ON C.ID_CONTENT = CC.ID_CONTENT

    WHERE
      C.IS_ACTIVE = TRUE
      AND C.STATUS != 'ARCHIVED'
      AND (
        ARRAY_LENGTH(@topic_ids) = 0
        OR CT.ID_TOPIC IN UNNEST(@topic_ids)
      )
      AND (
        ARRAY_LENGTH(@company_ids) = 0
        OR CC.ID_COMPANY IN UNNEST(@company_ids)
      )
      AND C.DATE_CREATION BETWEEN @date_from AND @date_to

    ORDER BY
      COALESCE(C.PUBLISHED_AT, TIMESTAMP(C.DATE_CREATION)) DESC
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ArrayQueryParameter("topic_ids", "STRING", topic_ids or []),
            bigquery.ArrayQueryParameter("company_ids", "STRING", company_ids or []),
            bigquery.ScalarQueryParameter("date_from", "DATE", date_from),
            bigquery.ScalarQueryParameter("date_to", "DATE", date_to),
        ]
    )

    rows = client.query(sql, job_config=job_config).result()
    return [dict(r) for r in rows]


# ============================================================
# 2. CREATE SYNTHESIS (META ONLY)
# ============================================================
def create_synthesis(
    id_model: str,
    synthesis_type: str,
    date_from: date,
    date_to: date,
) -> str:
    """
    Crée une synthèse vide (DRAFT).
    """

    id_synthesis = str(uuid.uuid4())
    now = datetime.utcnow()

    insert_bq(
        TABLE_SYNTHESIS,
        [{
            "ID_SYNTHESIS": id_synthesis,
            "ID_MODEL": id_model,
            "TYPE": synthesis_type,
            "DATE_FROM": date_from,
            "DATE_TO": date_to,
            "STATUS": "DRAFT",
            "CREATED_AT": now,
            "UPDATED_AT": now,
        }]
    )

    return id_synthesis


# ============================================================
# 3. ATTACH CONTENTS TO SYNTHESIS
# ============================================================
def attach_contents_to_synthesis(
    id_synthesis: str,
    content_ids: List[str],
):
    """
    Associe les analyses sélectionnées (max 5) à une synthèse.
    """

    now = datetime.utcnow()

    rows = [
        {
            "ID_SYNTHESIS": id_synthesis,
            "ID_CONTENT": cid,
            "POSITION": idx + 1,
            "CREATED_AT": now,
        }
        for idx, cid in enumerate(content_ids)
    ]

    insert_bq(TABLE_SYNTHESIS_CONTENT, rows)


# ============================================================
# 4. EXTRACT SYNTHESIS DATA
# ============================================================
def extract_synthesis_data(
    id_synthesis: str,
) -> Dict:
    """
    Extrait les données nécessaires à la synthèse
    selon son type (CHIFFRES / ANALYTIQUE / CARTOGRAPHIE).
    """

    client = get_bigquery_client()

    # --- récupérer type de synthèse
    meta = query_bq(
        f"""
        SELECT TYPE
        FROM `{TABLE_SYNTHESIS}`
        WHERE ID_SYNTHESIS = @id
        LIMIT 1
        """,
        {"id": id_synthesis}
    )

    if not meta:
        raise ValueError("Synthèse introuvable")

    synthesis_type = meta[0]["TYPE"]

    # --- récupérer contenus liés
    contents = query_bq(
        f"""
        SELECT
          C.ID_CONTENT,
          C.ANGLE_TITLE,
          C.EXCERPT,
          C.CHIFFRES,
          C.CITATIONS
        FROM `{TABLE_SYNTHESIS_CONTENT}` SC
        JOIN `{TABLE_CONTENT}` C
          ON SC.ID_CONTENT = C.ID_CONTENT
        WHERE SC.ID_SYNTHESIS = @id
        ORDER BY SC.POSITION
        """,
        {"id": id_synthesis}
    )

    # ========================================================
    # TYPE : CHIFFRES
    # ========================================================
    if synthesis_type == "CHIFFRES":
        chiffres = []
        for c in contents:
            for ch in c.get("CHIFFRES") or []:
                chiffres.append({
                    "value": ch,
                    "id_content": c["ID_CONTENT"],
                    "angle_title": c["ANGLE_TITLE"],
                })

        return {
            "type": "CHIFFRES",
            "items": chiffres,
        }

    # ========================================================
    # TYPE : ANALYTIQUE DESCRIPTIF
    # ========================================================
    if synthesis_type == "ANALYTIQUE":
        angles = [
            {
                "id_content": c["ID_CONTENT"],
                "angle_title": c["ANGLE_TITLE"],
                "excerpt": c.get("EXCERPT"),
            }
            for c in contents
        ]

        return {
            "type": "ANALYTIQUE",
            "items": angles,
        }

    # ========================================================
    # TYPE : CARTOGRAPHIE
    # ========================================================
    if synthesis_type == "CARTOGRAPHIE":
        repartition = {
            "total_analyses": len(contents),
        }

        return {
            "type": "CARTOGRAPHIE",
            "items": repartition,
        }

    raise ValueError(f"Type de synthèse inconnu : {synthesis_type}")


# ============================================================
# 5. GET SYNTHESIS PREVIEW
# ============================================================
def get_synthesis_preview(
    id_synthesis: str,
) -> Dict:
    """
    Prévisualisation finale ADMIN.
    """

    data = extract_synthesis_data(id_synthesis)

    return {
        "id_synthesis": id_synthesis,
        "preview": data,
    }
