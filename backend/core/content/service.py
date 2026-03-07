import uuid
from datetime import datetime, timezone, date
from typing import Optional, Dict, Any

from google.cloud import bigquery

from config import BQ_PROJECT, BQ_DATASET
from api.content.models import ContentCreate, ContentUpdate
from core.content.ai import generate_summary
from utils.bigquery_utils import (
    query_bq,
    insert_bq,
    update_bq,
    get_bigquery_client,
)

# ============================================================
# TABLES
# ============================================================

TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"

TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_CONTENT_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_EVENT"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"
TABLE_CONTENT_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_PERSON"

TABLE_CONTENT_CONCEPT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_CONCEPT"
TABLE_CONTENT_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_SOLUTION"
TABLE_CONTENT_RAW = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_RAW"

TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_EVENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_EVENT"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"
TABLE_PERSON = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_PERSON"
TABLE_CONCEPT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONCEPT"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"



# ============================================================
# UTILS
# ============================================================

def normalize_array(value):
    if value is None:
        return []

    if isinstance(value, list):
        return [
            str(v).strip()
            for v in value
            if str(v).strip()
        ]

    return []


# ============================================================
# CREATE CONTENT
# ============================================================

def create_content(data: ContentCreate) -> str:

    if not data.title or not data.title.strip():
        raise ValueError("TITLE obligatoire")

    if not data.content_body or not data.content_body.strip():
        raise ValueError("CONTENT_BODY obligatoire")

    content_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    row = [{
        "ID_CONTENT": content_id,
        "STATUS": "DRAFT",
        "IS_ACTIVE": True,
        "AUTHOR": data.author,

        "SOURCE_ID": data.source_id,
        "SOURCE_PUBLISHED_AT": (
            data.source_published_at.isoformat()
            if data.source_published_at
            else None
        ),
        "TITLE": data.title.strip(),
        "EXCERPT": data.excerpt,
        "CONTENT_BODY": data.content_body,

        "CITATIONS": normalize_array(data.citations),
        "CHIFFRES": normalize_array(data.chiffres),
        "ACTEURS_CITES": normalize_array(data.acteurs_cites),

        "CONCEPTS_LLM": normalize_array(data.concepts_llm),
        "SOLUTIONS_LLM": normalize_array(data.solutions_llm),
        "TOPICS_LLM": normalize_array(data.topics_llm),

        "MECANIQUE_EXPLIQUEE": data.mecanique_expliquee,
        "ENJEU_STRATEGIQUE": data.enjeu_strategique,
        "POINT_DE_FRICTION": data.point_de_friction,
        "SIGNAL_ANALYTIQUE": data.signal_analytique,

        "SEO_TITLE": data.seo_title,
        "SEO_DESCRIPTION": data.seo_description,

        "PUBLISHED_AT": None,
        "CREATED_AT": now,
        "UPDATED_AT": now,
    }]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        TABLE_CONTENT,
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    if data.topics:
        insert_bq(
            TABLE_CONTENT_TOPIC,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_TOPIC": tid,
                    "CREATED_AT": now
                }
                for tid in data.topics
            ],
        )

    if data.events:
        insert_bq(
            TABLE_CONTENT_EVENT,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_EVENT": eid,
                    "CREATED_AT": now
                }
                for eid in data.events
            ],
        )

    if data.companies:
        insert_bq(
            TABLE_CONTENT_COMPANY,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_COMPANY": cid,
                    "CREATED_AT": now
                }
                for cid in data.companies
            ],
        )

    if data.persons:
        insert_bq(
            TABLE_CONTENT_PERSON,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_PERSON": p.id_person,
                    "ROLE": p.role,
                    "CREATED_AT": now,
                }
                for p in data.persons
            ],
        )

    if data.concepts:
        insert_bq(
            TABLE_CONTENT_CONCEPT,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_CONCEPT": cid,
                    "CREATED_AT": now
                }
                for cid in data.concepts
            ],
        )

    if data.solutions:
        insert_bq(
            TABLE_CONTENT_SOLUTION,
            [
                {
                    "ID_CONTENT": content_id,
                    "ID_SOLUTION": sid,
                    "CREATED_AT": now
                }
                for sid in data.solutions
            ],
        )

    return content_id

# ============================================================
# GET CONTENT
# ============================================================

def get_content(id_content: str):

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          STATUS,
          SOURCE_ID,
          TITLE,
          EXCERPT,
          CONTENT_BODY,
          CITATIONS,
          CHIFFRES,
          ACTEURS_CITES,
          CONCEPTS_LLM,
          SOLUTIONS_LLM,
          TOPICS_LLM,
          MECANIQUE_EXPLIQUEE,
          ENJEU_STRATEGIQUE,
          POINT_DE_FRICTION,
          SIGNAL_ANALYTIQUE,
          PUBLISHED_AT
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT = @id
        LIMIT 1
        """,
        {"id": id_content},
    )

    if not rows:
        return None

    row = rows[0]

    def map_dt(value):
        return value.isoformat() if value else None

    content = {
        "id_content": row["ID_CONTENT"],
        "status": row.get("STATUS"),
        "source_id": row.get("SOURCE_ID"),

        "title": row.get("TITLE"),
        "excerpt": row.get("EXCERPT"),
        "content_body": row.get("CONTENT_BODY"),

        "citations": row.get("CITATIONS") or [],
        "chiffres": row.get("CHIFFRES") or [],
        "acteurs_cites": row.get("ACTEURS_CITES") or [],

        "concepts_llm": row.get("CONCEPTS_LLM") or [],
        "solutions_llm": row.get("SOLUTIONS_LLM") or [],
        "topics_llm": row.get("TOPICS_LLM") or [],

        "mecanique_expliquee": row.get("MECANIQUE_EXPLIQUEE"),
        "enjeu_strategique": row.get("ENJEU_STRATEGIQUE"),
        "point_de_friction": row.get("POINT_DE_FRICTION"),
        "signal_analytique": row.get("SIGNAL_ANALYTIQUE"),

        "published_at": map_dt(row.get("PUBLISHED_AT")),
    }

    # ============================================================
    # RELATIONS — MAPPING SNAKE_CASE
    # ============================================================

    topic_rows = query_bq(
        f"""
        SELECT T.ID_TOPIC, T.LABEL, T.TOPIC_AXIS
        FROM `{TABLE_CONTENT_TOPIC}` CT
        JOIN `{TABLE_TOPIC}` T
          ON CT.ID_TOPIC = T.ID_TOPIC
        WHERE CT.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["topics"] = [
        {
            "id_topic": r["ID_TOPIC"],
            "label": r["LABEL"],
            "topic_axis": r.get("TOPIC_AXIS"),
        }
        for r in topic_rows
    ]

    event_rows = query_bq(
        f"""
        SELECT E.ID_EVENT, E.LABEL
        FROM `{TABLE_CONTENT_EVENT}` CE
        JOIN `{TABLE_EVENT}` E
          ON CE.ID_EVENT = E.ID_EVENT
        WHERE CE.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["events"] = [
        {
            "id_event": r["ID_EVENT"],
            "label": r["LABEL"],
        }
        for r in event_rows
    ]

    company_rows = query_bq(
        f"""
        SELECT C.ID_COMPANY, C.NAME
        FROM `{TABLE_CONTENT_COMPANY}` CC
        JOIN `{TABLE_COMPANY}` C
          ON CC.ID_COMPANY = C.ID_COMPANY
        WHERE CC.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["companies"] = [
        {
            "id_company": r["ID_COMPANY"],
            "name": r["NAME"],
        }
        for r in company_rows
    ]

    person_rows = query_bq(
        f"""
        SELECT P.ID_PERSON, P.NAME, CP.ROLE
        FROM `{TABLE_CONTENT_PERSON}` CP
        JOIN `{TABLE_PERSON}` P
          ON CP.ID_PERSON = P.ID_PERSON
        WHERE CP.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["persons"] = [
        {
            "id_person": r["ID_PERSON"],
            "name": r["NAME"],
            "role": r.get("ROLE"),
        }
        for r in person_rows
    ]

    concept_rows = query_bq(
        f"""
        SELECT C.ID_CONCEPT, C.TITLE
        FROM `{TABLE_CONTENT_CONCEPT}` CC
        JOIN `{TABLE_CONCEPT}` C
          ON CC.ID_CONCEPT = C.ID_CONCEPT
        WHERE CC.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["concepts"] = [
        {
            "id_concept": r["ID_CONCEPT"],
            "title": r["TITLE"],
        }
        for r in concept_rows
    ]

    solution_rows = query_bq(
        f"""
        SELECT S.ID_SOLUTION, S.NAME
        FROM `{TABLE_CONTENT_SOLUTION}` CS
        JOIN `{TABLE_SOLUTION}` S
          ON CS.ID_SOLUTION = S.ID_SOLUTION
        WHERE CS.ID_CONTENT = @id
        """,
        {"id": id_content},
    )

    content["solutions"] = [
        {
            "id_solution": r["ID_SOLUTION"],
            "name": r["NAME"],
        }
        for r in solution_rows
    ]

    return content


# ============================================================
# LIST CONTENTS (PUBLIC)
# ============================================================

def list_contents():

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          TITLE,
          EXCERPT,
          PUBLISHED_AT
        FROM `{TABLE_CONTENT}`
        WHERE
          STATUS = 'PUBLISHED'
          AND IS_ACTIVE = TRUE
        ORDER BY PUBLISHED_AT DESC
        """
    )

    def map_dt(value):
        return value.isoformat() if value else None

    return [
        {
            "id_content": r["ID_CONTENT"],
            "title": r["TITLE"],
            "excerpt": r.get("EXCERPT"),
            "published_at": map_dt(r.get("PUBLISHED_AT")),
        }
        for r in rows
    ]

# ============================================================
# LIST CONTENTS ADMIN
# ============================================================

def list_contents_admin():

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          TITLE,
          STATUS,
          PUBLISHED_AT,
          UPDATED_AT
        FROM `{TABLE_CONTENT}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY UPDATED_AT DESC
        """
    )

    return [
        {
            "id_content": r["ID_CONTENT"],
            "title": r["TITLE"],
            "status": r["STATUS"],
            "published_at": (
                r["PUBLISHED_AT"].isoformat()
                if r.get("PUBLISHED_AT")
                else None
            ),
            "updated_at": (
                r["UPDATED_AT"].isoformat()
                if r.get("UPDATED_AT")
                else None
            ),
        }
        for r in rows
    ]


# ============================================================
# STORE RAW CONTENT
# ============================================================

def store_raw_content(
    source_id: str,
    source_title: str,
    raw_text: str,
    date_source: Optional[date] = None,
) -> str:

    if not source_id:
        raise ValueError("source_id obligatoire")

    if not source_title or not source_title.strip():
        raise ValueError("source_title obligatoire")

    if not raw_text or not raw_text.strip():
        raise ValueError("raw_text vide")

    raw_id = str(uuid.uuid4())

    now_iso = datetime.utcnow().isoformat()  # ✅ ISO STRING

    row = [{
        "ID_RAW": raw_id,
        "SOURCE_ID": source_id,
        "SOURCE_TITLE": source_title.strip(),
        "RAW_TEXT": raw_text.strip(),
        "DATE_SOURCE": date_source.isoformat() if date_source else None,
        "STATUS": "STORED",
        "CREATED_AT": now_iso,        # ✅ string
        "PROCESSED_AT": None,
        "GENERATED_CONTENT_ID": None,
        "ERROR_MESSAGE": None,
    }]

    client = get_bigquery_client()

    client.load_table_from_json(
        row,
        "adex-5555.RATECARD.RATECARD_CONTENT_RAW",
        job_config=bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND"
        ),
    ).result()

    return raw_id

def list_raw_stock():
    query = """
        SELECT
            ID_RAW,
            SOURCE_ID,
            SOURCE_TITLE,
            DATE_SOURCE,
            STATUS,
            CREATED_AT
        FROM `adex-5555.RATECARD.RATECARD_CONTENT_RAW`
        WHERE STATUS = 'STORED'
        ORDER BY CREATED_AT ASC
    """

    rows = query_bq(query)

    return [
        {
            "id_raw": r["ID_RAW"],
            "source_id": r["SOURCE_ID"],
            "source_title": r["SOURCE_TITLE"],
            "date_source": r.get("DATE_SOURCE"),
            "status": r["STATUS"],
            "created_at": r["CREATED_AT"],
        }
        for r in rows
    ]

def destock_raw_contents(limit: int = 5) -> Dict[str, Any]:

    raws = query_bq(f"""
        SELECT *
        FROM `{TABLE_CONTENT_RAW}`
        WHERE STATUS = 'STORED'
        ORDER BY CREATED_AT ASC
        LIMIT {limit}
    """)

    processed = 0
    errors = 0

    for raw in raws:

        raw_id = raw["ID_RAW"]

        try:

            print("\n==============================")
            print("RAW ID:", raw_id)
            print("SOURCE_ID:", raw.get("SOURCE_ID"))
            print("RAW LENGTH:", len(raw.get("RAW_TEXT", "") or ""))
            print("---- RAW TEXT AUTO ----")
            print(raw.get("RAW_TEXT"))
            print("-----------------------")

            # ====================================================
            # 1️⃣ PASS TO PROCESSING
            # ====================================================

            update_bq(
                TABLE_CONTENT_RAW,
                {
                    "STATUS": "PROCESSING",
                    "ERROR_MESSAGE": None,
                },
                where={"ID_RAW": raw_id}
            )

            # ====================================================
            # 2️⃣ GENERATE SUMMARY
            # ====================================================

            summary = generate_summary(
                source_id=raw.get("SOURCE_ID"),
                source_text=raw.get("RAW_TEXT", "")
            )

            print("\n---- SUMMARY RETURN ----")
            print(summary)
            print("------------------------")

            print("CONCEPTS RAW:", summary.get("concepts"))
            print("SOLUTIONS RAW:", summary.get("solutions"))
            print("TOPICS RAW:", summary.get("topics"))

            # ====================================================
            # 3️⃣ BUILD CONTENT MODEL (Pydantic)
            # ====================================================

            concepts_llm = [c["label"] for c in summary.get("concepts", [])]
            solutions_llm = summary.get("solutions", [])
            topics_llm = summary.get("topics", [])

            print("\n---- LLM ARRAYS ----")
            print("concepts_llm:", concepts_llm)
            print("solutions_llm:", solutions_llm)
            print("topics_llm:", topics_llm)
            print("--------------------")

            content_payload = ContentCreate(
                title=summary.get("title"),
                excerpt=summary.get("excerpt"),
                content_body=summary.get("content_body"),
                citations=summary.get("citations", []),
                chiffres=summary.get("chiffres", []),
                acteurs_cites=summary.get("acteurs_cites", []),
                concepts_llm=concepts_llm,
                solutions_llm=solutions_llm,
                topics_llm=topics_llm,
                mecanique_expliquee=summary.get("mecanique_expliquee"),
                enjeu_strategique=summary.get("enjeu_strategique"),
                point_de_friction=summary.get("point_de_friction"),
                signal_analytique=summary.get("signal_analytique"),
                source_id=raw.get("SOURCE_ID"),
                author=None,
            )

            print("\n---- CONTENT PAYLOAD DICT ----")
            print(content_payload.model_dump())
            print("--------------------------------")

            # ====================================================
            # 4️⃣ CREATE CONTENT
            # ====================================================

            content_id = create_content(content_payload)

            print("CREATED CONTENT ID:", content_id)

            # ====================================================
            # 5️⃣ MARK RAW AS PROCESSED
            # ====================================================

            update_bq(
                TABLE_CONTENT_RAW,
                {
                    "STATUS": "PROCESSED",
                    "PROCESSED_AT": datetime.utcnow().isoformat(),
                    "GENERATED_CONTENT_ID": content_id,
                    "ERROR_MESSAGE": None,
                },
                where={"ID_RAW": raw_id}
            )

            processed += 1

        except Exception as e:

            print("\n❌ ERROR DURING DESTOCK")
            print(str(e))

            update_bq(
                TABLE_CONTENT_RAW,
                {
                    "STATUS": "ERROR",
                    "ERROR_MESSAGE": str(e),
                },
                where={"ID_RAW": raw_id}
            )

            errors += 1

    print("\n==== DESTOCK RESULT ====")
    print("Processed:", processed)
    print("Errors:", errors)
    print("========================\n")

    return {
        "processed": processed,
        "errors": errors,
        "total_selected": len(raws),
    }


def delete_raw_content(id_raw: str) -> None:

    if not id_raw:
        raise ValueError("id_raw obligatoire")

    query = """
        DELETE FROM `adex-5555.RATECARD.RATECARD_CONTENT_RAW`
        WHERE ID_RAW = @id_raw
    """

    update_bq(
        query,
        {
            "id_raw": id_raw
        }
    )

# ============================================================
# RESET RELATIONS
# ============================================================

def reset_and_insert(table, id_field, id_content, values):

    client = get_bigquery_client()
    now = datetime.now(timezone.utc).isoformat()

    client.query(
        f"DELETE FROM `{table}` WHERE ID_CONTENT = @id",
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter(
                    "id", "STRING", id_content
                )
            ]
        ),
    ).result()

    if values:

        insert_bq(
            table,
            [
                {
                    "ID_CONTENT": id_content,
                    id_field: v,
                    "CREATED_AT": now,
                }
                for v in values
            ],
        )


# ============================================================
# UPDATE CONTENT
# ============================================================
def update_content(id_content: str, data: ContentUpdate):

    now = datetime.now(timezone.utc)

    fields = {}

    # ============================================================
    # SOURCE
    # ============================================================

    if data.source_id is not None:
        fields["SOURCE_ID"] = data.source_id

    if data.source_text is not None:
        fields["SOURCE_TEXT"] = data.source_text

    if data.source_url is not None:
        fields["SOURCE_URL"] = data.source_url

    if data.source_author is not None:
        fields["SOURCE_AUTHOR"] = data.source_author

    # ============================================================
    # SUMMARY
    # ============================================================

    if data.title is not None:
        fields["TITLE"] = data.title.strip()

    if data.excerpt is not None:
        fields["EXCERPT"] = data.excerpt

    if data.content_body is not None:
        fields["CONTENT_BODY"] = data.content_body

    # ============================================================
    # EXTRACTIONS STRUCTURÉES
    # ============================================================

    if data.citations is not None:
        fields["CITATIONS"] = normalize_array(data.citations)

    if data.chiffres is not None:
        fields["CHIFFRES"] = normalize_array(data.chiffres)

    if data.acteurs_cites is not None:
        fields["ACTEURS_CITES"] = normalize_array(data.acteurs_cites)

    if data.concepts_llm is not None:
        fields["CONCEPTS_LLM"] = normalize_array(data.concepts_llm)

    if data.solutions_llm is not None:
        fields["SOLUTIONS_LLM"] = normalize_array(data.solutions_llm)

    if data.topics_llm is not None:
        fields["TOPICS_LLM"] = normalize_array(data.topics_llm)

    # ============================================================
    # ANALYSE STRATÉGIQUE
    # ============================================================

    if data.mecanique_expliquee is not None:
        fields["MECANIQUE_EXPLIQUEE"] = data.mecanique_expliquee

    if data.enjeu_strategique is not None:
        fields["ENJEU_STRATEGIQUE"] = data.enjeu_strategique

    if data.point_de_friction is not None:
        fields["POINT_DE_FRICTION"] = data.point_de_friction

    if data.signal_analytique is not None:
        fields["SIGNAL_ANALYTIQUE"] = data.signal_analytique

    # ============================================================
    # SEO
    # ============================================================

    if data.seo_title is not None:
        fields["SEO_TITLE"] = data.seo_title

    if data.seo_description is not None:
        fields["SEO_DESCRIPTION"] = data.seo_description

    # ============================================================
    # META
    # ============================================================

    if data.author is not None:
        fields["AUTHOR"] = data.author

    # Toujours mettre à jour UPDATED_AT
    fields["UPDATED_AT"] = now

    # ============================================================
    # UPDATE TABLE PRINCIPALE
    # ============================================================

    if fields:
        update_bq(
            table=TABLE_CONTENT,
            fields=fields,
            where={"ID_CONTENT": id_content},
        )

    # ============================================================
    # RESET RELATIONS
    # ============================================================

    reset_and_insert(
        TABLE_CONTENT_TOPIC,
        "ID_TOPIC",
        id_content,
        data.topics if data.topics is not None else [],
    )

    reset_and_insert(
        TABLE_CONTENT_EVENT,
        "ID_EVENT",
        id_content,
        data.events if data.events is not None else [],
    )

    reset_and_insert(
        TABLE_CONTENT_COMPANY,
        "ID_COMPANY",
        id_content,
        data.companies if data.companies is not None else [],
    )

    reset_and_insert(
        TABLE_CONTENT_CONCEPT,
        "ID_CONCEPT",
        id_content,
        data.concepts if data.concepts is not None else [],
    )

    reset_and_insert(
        TABLE_CONTENT_SOLUTION,
        "ID_SOLUTION",
        id_content,
        data.solutions if data.solutions is not None else [],
    )

    # ============================================================
    # PERSONS (gestion spécifique car rôle)
    # ============================================================

    client = get_bigquery_client()

    client.query(
        f"""
        DELETE FROM `{TABLE_CONTENT_PERSON}`
        WHERE ID_CONTENT = @id
        """,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter(
                    "id", "STRING", id_content
                )
            ]
        ),
    ).result()

    if data.persons:
        insert_bq(
            TABLE_CONTENT_PERSON,
            [
                {
                    "ID_CONTENT": id_content,
                    "ID_PERSON": p.id_person,
                    "ROLE": p.role,
                    "CREATED_AT": now,
                }
                for p in data.persons
            ],
        )

    return True

# ============================================================
# ARCHIVE CONTENT
# ============================================================

def archive_content(id_content: str):

    update_bq(
        table=TABLE_CONTENT,
        fields={"STATUS": "ARCHIVED"},
        where={"ID_CONTENT": id_content},
    )

    return True


# ============================================================
# PUBLISH CONTENT
# ============================================================

def publish_content(
    id_content: str,
    published_at: Optional[datetime] = None,
):

    now_dt = datetime.now(timezone.utc)

    # ============================================================
    # DÉTERMINATION DATE & STATUS
    # ============================================================

    if published_at is None:
        final_dt = now_dt
        status = "PUBLISHED"

    else:
        # Si datetime naïf → on force UTC
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)

        final_dt = published_at

        if final_dt <= now_dt:
            status = "PUBLISHED"
        else:
            status = "SCHEDULED"

    # ============================================================
    # UPDATE BQ
    # ============================================================

    update_bq(
        table=TABLE_CONTENT,
        fields={
            "STATUS": status,
            "PUBLISHED_AT": final_dt,
            "UPDATED_AT": now_dt,
        },
        where={"ID_CONTENT": id_content},
    )

    return status

# ============================================================
# CONTENT STATS
# ============================================================

def get_content_stats():

    sql = f"""
        SELECT
          COUNT(*) AS TOTAL,
          COUNTIF(STATUS = 'PUBLISHED') AS TOTAL_PUBLISHED,
          COUNTIF(STATUS = 'DRAFT') AS TOTAL_DRAFT,
          COUNTIF(
            STATUS = 'PUBLISHED'
            AND EXTRACT(YEAR FROM PUBLISHED_AT)
                = EXTRACT(YEAR FROM CURRENT_DATE())
          ) AS TOTAL_PUBLISHED_THIS_YEAR,
          COUNTIF(
            STATUS = 'PUBLISHED'
            AND EXTRACT(YEAR FROM PUBLISHED_AT)
                = EXTRACT(YEAR FROM CURRENT_DATE())
            AND EXTRACT(MONTH FROM PUBLISHED_AT)
                = EXTRACT(MONTH FROM CURRENT_DATE())
          ) AS TOTAL_PUBLISHED_THIS_MONTH
        FROM `{TABLE_CONTENT}`
    """

    rows = query_bq(sql)

    if not rows:
        return {
            "total": 0,
            "total_published": 0,
            "total_draft": 0,
            "total_published_this_year": 0,
            "total_published_this_month": 0,
        }

    r = rows[0]

    return {
        "total": r.get("TOTAL", 0),
        "total_published": r.get("TOTAL_PUBLISHED", 0),
        "total_draft": r.get("TOTAL_DRAFT", 0),
        "total_published_this_year": r.get("TOTAL_PUBLISHED_THIS_YEAR", 0),
        "total_published_this_month": r.get("TOTAL_PUBLISHED_THIS_MONTH", 0),
    }

def delete_content(id_content: str):

    client = get_bigquery_client()

    tables = [
        TABLE_CONTENT_TOPIC,
        TABLE_CONTENT_COMPANY,
        TABLE_CONTENT_CONCEPT,
        TABLE_CONTENT_SOLUTION,
    ]

    for table in tables:
        client.query(
            f"""
            DELETE FROM `{table}`
            WHERE ID_CONTENT = @id
            """,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(
                        "id", "STRING", id_content
                    ),
                ]
            ),
        ).result()

    client.query(
        f"""
        DELETE FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT = @id
        """,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter(
                    "id", "STRING", id_content
                ),
            ]
        ),
    ).result()
