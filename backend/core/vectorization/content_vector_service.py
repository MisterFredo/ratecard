import os
from typing import List, Dict, Any

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import get_bigquery_client, query_bq, update_bq
from utils.pinecone_utils import get_pinecone_index, is_pinecone_enabled

from openai import OpenAI


# --------------------------------------------------
# CONFIG
# --------------------------------------------------

OPENAI_MODEL = "text-embedding-3-small"

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Tables BigQuery
TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"
TABLE_CONTENT_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_TOPIC"
TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_CONTENT_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_SOLUTION"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"
TABLE_CONTENT_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT_COMPANY"
TABLE_COMPANY = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_COMPANY"


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def clean_html(text: str) -> str:
    import re
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", "", text)
    return clean.strip()


def embed_text(text: str) -> List[float]:
    response = client.embeddings.create(
        model=OPENAI_MODEL,
        input=text
    )
    return response.data[0].embedding


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

def load_content(content_id: str) -> Dict[str, Any]:

    query = f"""
        SELECT *
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT = '{content_id}'
        LIMIT 1
    """

    rows = query_bq(query)

    if not rows:
        raise ValueError(f"Content not found: {content_id}")

    return rows[0]


def load_topics(content_id: str) -> List[str]:

    query = f"""
        SELECT t.LABEL
        FROM `{TABLE_CONTENT_TOPIC}` ct
        JOIN `{TABLE_TOPIC}` t
        ON ct.ID_TOPIC = t.ID_TOPIC
        WHERE ct.ID_CONTENT = '{content_id}'
    """

    rows = query_bq(query)

    return [r["LABEL"] for r in rows if r.get("LABEL")]


def load_solutions(content_id: str) -> List[str]:

    query = f"""
        SELECT s.NAME
        FROM `{TABLE_CONTENT_SOLUTION}` cs
        JOIN `{TABLE_SOLUTION}` s
        ON cs.ID_SOLUTION = s.ID_SOLUTION
        WHERE cs.ID_CONTENT = '{content_id}'
    """

    rows = query_bq(query)

    return [r["NAME"] for r in rows if r.get("NAME")]


def load_companies(content_id: str) -> List[str]:

    query = f"""
        SELECT c.NAME
        FROM `{TABLE_CONTENT_COMPANY}` cc
        JOIN `{TABLE_COMPANY}` c
        ON cc.ID_COMPANY = c.ID_COMPANY
        WHERE cc.ID_CONTENT = '{content_id}'
    """

    rows = query_bq(query)

    return [r["NAME"] for r in rows if r.get("NAME")]


# --------------------------------------------------
# BLOCKS
# --------------------------------------------------

def build_content_blocks(content: Dict[str, Any]) -> Dict[str, str]:

    blocs = {
        "SIGNAL": content.get("SIGNAL_ANALYTIQUE"),
        "MECANIQUE": content.get("MECANIQUE_EXPLIQUEE"),
        "ENJEU": content.get("ENJEU_STRATEGIQUE"),
        "FRICTION": content.get("POINT_DE_FRICTION"),
        "BODY": clean_html(content.get("CONTENT_BODY", ""))[:2000],
    }

    return blocs


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def vectorize_content(content_id: str) -> Dict[str, Any]:

    print("=== VECTORIZE CONTENT START ===", content_id)

    if not is_pinecone_enabled():
        print("❌ Pinecone disabled")
        return {"status": "disabled"}

    print("✅ Pinecone enabled")

    index = get_pinecone_index()
    print("✅ Pinecone index loaded")

    # ----------------------------------------
    # LOAD DATA
    # ----------------------------------------

    content = load_content(content_id)
    print("✅ CONTENT LOADED:", content.get("TITLE"))

    topics = load_topics(content_id)
    print("✅ TOPICS:", topics)

    solutions = load_solutions(content_id)
    print("✅ SOLUTIONS:", solutions)

    companies = load_companies(content_id)
    print("✅ COMPANIES:", companies)

    concepts_llm = [
        str(c) for c in (content.get("CONCEPTS_LLM") or [])
        if c
    ]
    print("✅ CONCEPTS_LLM:", concepts_llm)

    blocs = build_content_blocks(content)
    print("✅ BLOCS:", list(blocs.keys()))

    vectors = []

    # ----------------------------------------
    # BUILD VECTORS
    # ----------------------------------------

    for bloc_type, text in blocs.items():

        if not text or str(text).strip() == "":
            print(f"⚠️ EMPTY BLOCK SKIPPED: {bloc_type}")
            continue

        print(f"➡️ PROCESS BLOCK: {bloc_type}")

        enriched_text = f"""
TYPE: content
BLOC: {bloc_type}

TITLE:
{content.get("TITLE")}

CONTENT:
{text}

TOPICS:
{", ".join(topics)}

SOLUTIONS:
{", ".join(solutions)}

COMPANIES:
{", ".join(companies)}

CONCEPTS:
{", ".join(concepts_llm)}
        """.strip()

        print("🧠 EMBEDDING START")

        embedding = embed_text(enriched_text)

        print("✅ EMBEDDING DONE - size:", len(embedding))

        vector_id = f"content_{content_id}_{bloc_type}"

        metadata = {
            "type": "content",
            "id_content": content_id,
            "bloc_type": bloc_type,

            "title": content.get("TITLE"),
            "excerpt": content.get("EXCERPT"),

            "content": str(text)[:500],

            "topics": topics,
            "solutions": solutions,
            "companies": companies,
            "concepts_llm": concepts_llm,

            "status": content.get("STATUS"),
            "published_at": str(content.get("PUBLISHED_AT")),
        }

        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": metadata
        })

    print("📦 TOTAL VECTORS:", len(vectors))

    # ----------------------------------------
    # UPSERT + UPDATE BQ
    # ----------------------------------------

    if vectors:
        print("🚀 UPSERT START")

        index.upsert(vectors)

        print("✅ UPSERT DONE")

        print("📝 UPDATE BQ START")

        update_bq(
            table=TABLE_CONTENT,
            fields={
                "IS_VECTORIZED": True
            },
            where={
                "ID_CONTENT": content_id
            }
        )

        print("✅ UPDATE BQ DONE")

    else:
        print("⚠️ NO VECTORS TO UPSERT")

    print("=== VECTORIZE CONTENT END ===")

    return {
        "status": "ok",
        "type": "content",
        "content_id": content_id,
        "nb_vectors": len(vectors)
    }


# --------------------------------------------------
# STATUS
# --------------------------------------------------

def get_content_vector_status(limit: int = 50, offset: int = 0):

    print("=== GET CONTENT VECTOR STATUS ===")

    # ----------------------------------------
    # DEBUG BQ CONTEXT
    # ----------------------------------------

    client = get_bigquery_client()
    print("BQ PROJECT VECTOR:", client.project)
    print("TABLE USED:", TABLE_CONTENT)
    print("LIMIT:", limit, "OFFSET:", offset)

    # ----------------------------------------
    # TEST SIMPLE (COUNT)
    # ----------------------------------------

    count_rows = query_bq(f"""
        SELECT COUNT(*) as c
        FROM `{TABLE_CONTENT}`
    """)

    print("COUNT CONTENT:", count_rows)

    # ----------------------------------------
    # LOAD CONTENT (AVEC OFFSET 🔥)
    # ----------------------------------------

    sql = f"""
        SELECT
            ID_CONTENT,
            TITLE,
            STATUS,
            PUBLISHED_AT
        FROM `{TABLE_CONTENT}`
        WHERE IS_ACTIVE = TRUE
        ORDER BY CREATED_AT DESC
        LIMIT {limit}
        OFFSET {offset}
    """

    print("SQL:", sql)

    content_list = query_bq(sql)

    print("CONTENT LIST:", content_list[:2] if content_list else "EMPTY")

    if not content_list:
        return {"items": []}

    # ----------------------------------------
    # FLAGS VECTORISATION
    # ----------------------------------------

    ids = [c["ID_CONTENT"] for c in content_list]

    sql_flags = f"""
        SELECT
            ID_CONTENT,
            IFNULL(IS_VECTORIZED, FALSE) AS IS_VECTORIZED
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT IN UNNEST(@ids)
    """

    rows = query_bq(sql_flags, {"ids": ids})

    print("FLAGS:", rows[:2] if rows else "EMPTY")

    vector_map = {
        r["ID_CONTENT"]: r["IS_VECTORIZED"]
        for r in rows
    }

    # ----------------------------------------
    # MERGE FINAL
    # ----------------------------------------

    items = []

    for c in content_list:
        items.append({
            "id_content": c["ID_CONTENT"],
            "title": c["TITLE"],
            "status": c["STATUS"],
            "is_vectorized": vector_map.get(c["ID_CONTENT"], False),
            "updated_at": str(c.get("PUBLISHED_AT")) if c.get("PUBLISHED_AT") else None,
        })

    print("FINAL ITEMS COUNT:", len(items))

    return {"items": items}

# --------------------------------------------------
# BACKLOG SELECTION
# --------------------------------------------------

def get_content_to_vectorize(
    limit: int = 50,
    offset: int = 0,
    status: str = None
) -> List[str]:

    print("=== GET CONTENT TO VECTORIZE ===")

    conditions = []

    # ----------------------------------------
    # FILTER VECTOR STATUS
    # ----------------------------------------

    if status == "NOT_VECTORIZED":
        conditions.append("IFNULL(IS_VECTORIZED, FALSE) = FALSE")

    elif status == "VECTORIZED":
        conditions.append("IFNULL(IS_VECTORIZED, FALSE) = TRUE")

    elif status == "ERROR":
        # même logique pour l’instant (évolutif)
        conditions.append("IFNULL(IS_VECTORIZED, FALSE) = FALSE")

    # ----------------------------------------
    # FILTRES MÉTIER (IMPORTANT)
    # ----------------------------------------

    conditions.append("IS_ACTIVE = TRUE")
    conditions.append("STATUS = 'PUBLISHED'")

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # ----------------------------------------
    # QUERY
    # ----------------------------------------

    sql = f"""
        SELECT ID_CONTENT
        FROM `{TABLE_CONTENT}`
        {where_clause}
        ORDER BY CREATED_AT DESC
        LIMIT {limit}
        OFFSET {offset}
    """

    print("SQL:", sql)

    rows = query_bq(sql)

    ids = [r["ID_CONTENT"] for r in rows]

    print("FOUND:", len(ids))

    return ids
