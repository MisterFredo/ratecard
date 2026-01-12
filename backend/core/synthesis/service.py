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
# 1. LIST CANDIDATE CONTENTS (ADMIN) — FINAL
# ============================================================
def list_candidate_contents(
    topic_ids: List[str],
    company_ids: List[str],
    date_from: str,
    date_to: str,
) -> List[Dict]:

    client = get_bigquery_client()

    where_clauses = [
        "C.IS_ACTIVE = TRUE",
        "C.STATUS != 'ARCHIVED'",
        "C.DATE_CREATION BETWEEN DATE(@date_from) AND DATE(@date_to)",
    ]

    # Filtre topics (SI fournis)
    if topic_ids:
        where_clauses.append(
            f"""
            EXISTS (
              SELECT 1
              FROM `{TABLE_CONTENT_TOPIC}` CT
              WHERE CT.ID_CONTENT = C.ID_CONTENT
                AND CT.ID_TOPIC IN UNNEST(@topic_ids)
            )
            """
        )

    # Filtre sociétés (SI fournies)
    if company_ids:
        where_clauses.append(
            f"""
            EXISTS (
              SELECT 1
              FROM `{TABLE_CONTENT_COMPANY}` CC
              WHERE CC.ID_CONTENT = C.ID_CONTENT
                AND CC.ID_COMPANY IN UNNEST(@company_ids)
            )
            """
        )

    where_sql = " AND ".join(where_clauses)

    sql = f"""
    SELECT
      C.ID_CONTENT,
      C.ANGLE_TITLE,
      C.EXCERPT,
      C.CHIFFRES,
      C.CITATIONS,
      C.DATE_CREATION,
      C.PUBLISHED_AT
    FROM `{TABLE_CONTENT}` C
    WHERE {where_sql}
    ORDER BY
      COALESCE(
        C.PUBLISHED_AT,
        TIMESTAMP(C.DATE_CREATION)
      ) DESC
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("date_from", "STRING", date_from),
            bigquery.ScalarQueryParameter("date_to", "STRING", date_to),
            bigquery.ArrayQueryParameter("topic_ids", "STRING", topic_ids),
            bigquery.ArrayQueryParameter("company_ids", "STRING", company_ids),
        ]
    )

    rows = list(client.query(sql, job_config=job_config).result())

    def serialize_row(row):
        out = dict(row)
        if isinstance(out.get("DATE_CREATION"), (date, datetime)):
            out["DATE_CREATION"] = out["DATE_CREATION"].isoformat()
        if isinstance(out.get("PUBLISHED_AT"), datetime):
            out["PUBLISHED_AT"] = out["PUBLISHED_AT"].isoformat()
        return out

    return [serialize_row(row) for row in rows]


# ============================================================
# 2. CREATE SYNTHESIS (META ONLY — FINAL)
# ============================================================
def create_synthesis(
    title: str,
    id_model: str,
    synthesis_type: str,
    date_from: str,   # format "YYYY-MM-DD"
    date_to: str,     # format "YYYY-MM-DD"
) -> str:
    """
    Crée une synthèse vide (DRAFT).
    Appelée UNIQUEMENT après validation humaine.
    """

    id_synthesis = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()  # JSON SAFE

    row = [{
        "ID_SYNTHESIS": id_synthesis,
        "TITLE": title,
        "ID_MODEL": id_model,
        "TYPE": synthesis_type,
        "DATE_FROM": date_from,
        "DATE_TO": date_to,
        "STATUS": "DRAFT",
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        TABLE_SYNTHESIS,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    return id_synthesis


# ============================================================
# 3. ATTACH CONTENTS TO SYNTHESIS (FINAL)
# ============================================================
def attach_contents_to_synthesis(
    id_synthesis: str,
    content_ids: List[str],
):
    """
    Associe les analyses sélectionnées (max 5) à une synthèse.
    """

    now = datetime.utcnow().isoformat()  # JSON SAFE

    rows = [
        {
            "ID_SYNTHESIS": id_synthesis,
            "ID_CONTENT": cid,
            "POSITION": idx + 1,
            "CREATED_AT": now,
        }
        for idx, cid in enumerate(content_ids)
    ]

    client = get_bigquery_client()

    client.load_table_from_json(
        rows,
        TABLE_SYNTHESIS_CONTENT,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()


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
          C.CONCEPT,        -- 👈 AJOUT
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
    # TYPE : ANALYTIQUE DESCRIPTIF (ENRICHI)
    # ========================================================
    if synthesis_type == "ANALYTIQUE":
        items = []

        for c in contents:
            items.append({
                "id_content": c["ID_CONTENT"],
                "angle_title": c["ANGLE_TITLE"],
                "excerpt": c.get("EXCERPT"),
                "concept": c.get("CONCEPT"),                 # 👈 AJOUT
                "chiffres": (c.get("CHIFFRES") or [])[:2],   # 👈 MAX 2
            })

        return {
            "type": "ANALYTIQUE",
            "items": items,
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

# ============================================================
# LIST SYNTHESIS (ADMIN)
# ============================================================
def list_syntheses():
    """
    Liste des synthèses pour l’ADMIN.
    Le titre opérationnel est l’identifiant principal.
    """

    rows = query_bq(
        f"""
        SELECT
          S.ID_SYNTHESIS,
          S.TITLE,           -- 👈 TITRE OPÉRATIONNEL
          S.TYPE,
          S.DATE_FROM,
          S.DATE_TO,
          S.STATUS,
          S.CREATED_AT
        FROM `{TABLE_SYNTHESIS}` S
        ORDER BY
          S.CREATED_AT DESC
        """
    )

    return [
        {
            "ID_SYNTHESIS": r["ID_SYNTHESIS"],
            "TITLE": r.get("TITLE"),        # 👈 RENVOYÉ AU FRONT
            "TYPE": r["TYPE"],
            "DATE_FROM": r.get("DATE_FROM"),
            "DATE_TO": r.get("DATE_TO"),
            "STATUS": r["STATUS"],
            "CREATED_AT": r["CREATED_AT"],
        }
        for r in rows
    ]

# ============================================================
# DELETE SYNTHESIS (ADMIN)
# ============================================================
def delete_synthesis(id_synthesis: str):
    """
    Suppression définitive d’une synthèse (ADMIN).
    """

    client = get_bigquery_client()

    # 1) Supprimer les liaisons contenus
    client.query(
        f"""
        DELETE FROM `{TABLE_SYNTHESIS_CONTENT}`
        WHERE ID_SYNTHESIS = @id
        """,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("id", "STRING", id_synthesis)
            ]
        ),
    ).result()

    # 2) Supprimer la synthèse
    client.query(
        f"""
        DELETE FROM `{TABLE_SYNTHESIS}`
        WHERE ID_SYNTHESIS = @id
        """,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("id", "STRING", id_synthesis)
            ]
        ),
    ).result()

    return True


