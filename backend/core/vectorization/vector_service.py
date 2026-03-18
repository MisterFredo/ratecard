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

# Tables BigQuery (alignées avec ton standard)
TABLE_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS"
TABLE_NEWS_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_TOPIC"
TABLE_TOPIC = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_TOPIC"
TABLE_NEWS_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_NEWS_SOLUTION"
TABLE_SOLUTION = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_SOLUTION"
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

def load_news(news_id: str) -> Dict[str, Any]:

    query = f"""
        SELECT *
        FROM `{TABLE_NEWS}`
        WHERE ID_NEWS = '{news_id}'
        LIMIT 1
    """

    rows = query_bq(query)

    if not rows:
        raise ValueError(f"News not found: {news_id}")

    return rows[0]

def load_news_topics(news_id: str) -> List[str]:

    query = f"""
        SELECT t.LABEL
        FROM `{TABLE_NEWS_TOPIC}` nt
        JOIN `{TABLE_TOPIC}` t
        ON nt.ID_TOPIC = t.ID_TOPIC
        WHERE nt.ID_NEWS = '{news_id}'
    """

    rows = query_bq(query)

    return [
        str(r["LABEL"])
        for r in rows
        if r.get("LABEL")
    ]

def load_news_solutions(news_id: str) -> List[str]:

    query = f"""
        SELECT s.NAME
        FROM `{TABLE_NEWS_SOLUTION}` ns
        JOIN `{TABLE_SOLUTION}` s
        ON ns.ID_SOLUTION = s.ID_SOLUTION
        WHERE ns.ID_NEWS = '{news_id}'
    """

    rows = query_bq(query)

    return [
        str(r["NAME"])
        for r in rows
        if r.get("NAME")
    ]


def load_company(company_id: str) -> str:

    if not company_id:
        return ""

    query = f"""
        SELECT NAME
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = '{company_id}'
        LIMIT 1
    """

    rows = query_bq(query)

    if not rows:
        return ""

    return rows[0]["NAME"]


# --------------------------------------------------
# BLOCKS
# --------------------------------------------------

def build_news_blocks(news: Dict[str, Any]) -> Dict[str, str]:

    signal = news.get("TITLE", "")
    angle = news.get("EXCERPT", "")
    body = clean_html(news.get("BODY", ""))[:1000]

    blocs = {
        "SIGNAL": signal,
        "ANGLE": angle,
    }

    if body:
        blocs["BODY"] = body

    return blocs


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def vectorize_news(news_id: str) -> Dict[str, Any]:

    print("=== VECTORIZE START ===", news_id)

    if not is_pinecone_enabled():
        print("❌ Pinecone disabled")
        return {"status": "disabled"}

    print("✅ Pinecone enabled")

    # ----------------------------------------
    # INIT INDEX
    # ----------------------------------------

    index = get_pinecone_index()
    print("✅ Pinecone index loaded")

    # ----------------------------------------
    # LOAD DATA
    # ----------------------------------------

    news = load_news(news_id)
    print("✅ NEWS LOADED:", news.get("TITLE"))

    topics = load_news_topics(news_id)
    print("✅ TOPICS:", topics)

    solutions = load_news_solutions(news_id)
    print("✅ SOLUTIONS:", solutions)

    company_name = load_company(news.get("ID_COMPANY"))
    print("✅ COMPANY:", company_name)

    blocs = build_news_blocks(news)
    print("✅ BLOCS:", list(blocs.keys()))

    vectors = []

    # ----------------------------------------
    # BUILD VECTORS
    # ----------------------------------------

    for bloc_type, text in blocs.items():

        if not text or text.strip() == "":
            print(f"⚠️ EMPTY BLOCK SKIPPED: {bloc_type}")
            continue

        print(f"➡️ PROCESS BLOCK: {bloc_type}")

        enriched_text = f"""
TYPE: news
BLOC: {bloc_type}

TITLE:
{news.get("TITLE")}

CONTENT:
{text}

COMPANY:
{company_name}

TOPICS:
{", ".join(topics)}

SOLUTIONS:
{", ".join(solutions)}
        """.strip()

        print("🧠 EMBEDDING START")

        embedding = embed_text(enriched_text)

        print("✅ EMBEDDING DONE - size:", len(embedding))

        vector_id = f"news_{news_id}_{bloc_type}"

        metadata = {
            "type": "news",
            "id_news": news_id,
            "bloc_type": bloc_type,

            "title": news.get("TITLE"),
            "excerpt": news.get("EXCERPT"),  # 🔥 AJOUT

            "content": text[:500],  # 🔥 CRUCIAL (preview bloc)

            "company": company_name,
            "topics": topics,
            "solutions": solutions,

            "news_type": news.get("NEWS_TYPE"),
            "news_kind": news.get("NEWS_KIND"),
            "published_at": str(news.get("PUBLISHED_AT")),
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
            table=TABLE_NEWS,
            fields={
                "IS_VECTORIZED": True
            },
            where={
                "ID_NEWS": news_id
            }
        )

        print("✅ UPDATE BQ DONE")

    else:
        print("⚠️ NO VECTORS TO UPSERT")

    print("=== VECTORIZE END ===")

    return {
        "status": "ok",
        "news_id": news_id,
        "nb_vectors": len(vectors)
    }

def get_news_vector_status(limit: int = 50):

    # ----------------------------------------
    # DEBUG BQ CONTEXT
    # ----------------------------------------

    client = get_bigquery_client()
    print("BQ PROJECT VECTOR:", client.project)
    print("TABLE USED:", TABLE_NEWS)

    # ----------------------------------------
    # TEST SIMPLE (COUNT)
    # ----------------------------------------

    count_rows = query_bq(f"""
        SELECT COUNT(*) as c
        FROM `{TABLE_NEWS}`
    """)

    print("COUNT VECTOR:", count_rows)

    # ----------------------------------------
    # LOAD NEWS (requête simple sans params)
    # ----------------------------------------

    sql = f"""
        SELECT
            ID_NEWS,
            TITLE,
            STATUS,
            PUBLISHED_AT
        FROM `{TABLE_NEWS}`
        ORDER BY CREATED_AT DESC
        LIMIT {limit}
    """

    news_list = query_bq(sql)

    print("NEWS LIST VECTOR:", news_list[:2] if news_list else "EMPTY")

    if not news_list:
        return {"items": []}

    # ----------------------------------------
    # FLAGS VECTORISATION
    # ----------------------------------------

    ids = [n["ID_NEWS"] for n in news_list]

    sql_flags = f"""
        SELECT
            ID_NEWS,
            IFNULL(IS_VECTORIZED, FALSE) AS IS_VECTORIZED
        FROM `{TABLE_NEWS}`
        WHERE ID_NEWS IN UNNEST(@ids)
    """

    rows = query_bq(sql_flags, {"ids": ids})

    print("FLAGS:", rows[:2] if rows else "EMPTY")

    vector_map = {
        r["ID_NEWS"]: r["IS_VECTORIZED"]
        for r in rows
    }

    # ----------------------------------------
    # MERGE FINAL
    # ----------------------------------------

    items = []

    for n in news_list:
        items.append({
            "id_news": n["ID_NEWS"],
            "title": n["TITLE"],
            "status": n["STATUS"],
            "is_vectorized": vector_map.get(n["ID_NEWS"], False),
            "updated_at": str(n.get("PUBLISHED_AT")) if n.get("PUBLISHED_AT") else None,
        })

    print("FINAL ITEMS COUNT:", len(items))

    return {"items": items}

# --------------------------------------------------
# BACKLOG SELECTION
# --------------------------------------------------

def get_news_to_vectorize(
    limit: int = 50,
    offset: int = 0,
    status: str = None
) -> List[str]:

    print("=== GET NEWS TO VECTORIZE ===")

    conditions = []

    # ----------------------------------------
    # FILTER STATUS VECTOR
    # ----------------------------------------

    if status == "NOT_VECTORIZED":
        conditions.append("IFNULL(IS_VECTORIZED, FALSE) = FALSE")

    elif status == "VECTORIZED":
        conditions.append("IFNULL(IS_VECTORIZED, FALSE) = TRUE")

    elif status == "ERROR":
        # si tu ajoutes un champ plus tard
        conditions.append("IFNULL(IS_VECTORIZED, FALSE) = FALSE")

    # ----------------------------------------
    # BASE FILTER (important)
    # ----------------------------------------

    conditions.append("STATUS = 'PUBLISHED'")

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # ----------------------------------------
    # QUERY
    # ----------------------------------------

    sql = f"""
        SELECT ID_NEWS
        FROM `{TABLE_NEWS}`
        {where_clause}
        ORDER BY CREATED_AT DESC
        LIMIT {limit}
        OFFSET {offset}
    """

    print("SQL:", sql)

    rows = query_bq(sql)

    ids = [r["ID_NEWS"] for r in rows]

    print("FOUND:", len(ids))

    return ids
