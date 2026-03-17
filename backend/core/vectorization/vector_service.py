import os
from typing import List, Dict, Any

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq, update_bq
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

    df = query_bq(query)

    if df.empty:
        raise ValueError(f"News not found: {news_id}")

    return df.iloc[0].to_dict()


def load_news_topics(news_id: str) -> List[str]:

    query = f"""
        SELECT t.LABEL
        FROM `{TABLE_NEWS_TOPIC}` nt
        JOIN `{TABLE_TOPIC}` t
        ON nt.ID_TOPIC = t.ID_TOPIC
        WHERE nt.ID_NEWS = '{news_id}'
    """

    df = query_bq(query)

    return df["LABEL"].dropna().tolist() if not df.empty else []


def load_news_solutions(news_id: str) -> List[str]:

    query = f"""
        SELECT s.NAME
        FROM `{TABLE_NEWS_SOLUTION}` ns
        JOIN `{TABLE_SOLUTION}` s
        ON ns.ID_SOLUTION = s.ID_SOLUTION
        WHERE ns.ID_NEWS = '{news_id}'
    """

    df = query_bq(query)

    return df["NAME"].dropna().tolist() if not df.empty else []


def load_company(company_id: str) -> str:

    if not company_id:
        return ""

    query = f"""
        SELECT NAME
        FROM `{TABLE_COMPANY}`
        WHERE ID_COMPANY = '{company_id}'
        LIMIT 1
    """

    df = query_bq(query)

    if df.empty:
        return ""

    return df.iloc[0]["NAME"]


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

    if not is_pinecone_enabled():
        return {"status": "disabled"}

    index = get_pinecone_index()

    # --- load data
    news = load_news(news_id)
    topics = load_news_topics(news_id)
    solutions = load_news_solutions(news_id)
    company_name = load_company(news.get("ID_COMPANY"))

    blocs = build_news_blocks(news)

    vectors = []

    for bloc_type, text in blocs.items():

        if not text or text.strip() == "":
            continue

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

        embedding = embed_text(enriched_text)

        vector_id = f"news_{news_id}_{bloc_type}"

        metadata = {
            "type": "news",
            "id_news": news_id,
            "bloc_type": bloc_type,
            "title": news.get("TITLE"),
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

    # ----------------------------------------
    # UPSERT + UPDATE BQ
    # ----------------------------------------

    if vectors:
        index.upsert(vectors)

        update_bq(
            table=TABLE_NEWS,
            rows=[{
                "ID_NEWS": news_id,
                "IS_VECTORIZED": True
            }],
            key_columns=["ID_NEWS"]
        )

    return {
        "status": "ok",
        "news_id": news_id,
        "nb_vectors": len(vectors)
    }

def get_news_vector_status(limit: int = 200):

    # 1️⃣ récupérer les news via ta fonction EXISTANTE
    news_list = list_news_admin(limit=limit, offset=0)

    if not news_list:
        return {"items": []}

    # 2️⃣ récupérer les flags de vectorisation
    ids = [n["id_news"] for n in news_list]

    sql = f"""
        SELECT
            ID_NEWS,
            IFNULL(IS_VECTORIZED, FALSE) AS IS_VECTORIZED
        FROM `{TABLE_NEWS}`
        WHERE ID_NEWS IN UNNEST(@ids)
    """

    rows = query_bq(sql, {"ids": ids})

    vector_map = {
        r["ID_NEWS"]: r["IS_VECTORIZED"]
        for r in rows
    }

    # 3️⃣ merge
    items = []

    for n in news_list:
        items.append({
            "id_news": n["id_news"],
            "title": n["title"],
            "status": n["status"],
            "is_vectorized": vector_map.get(n["id_news"], False),
            "updated_at": n.get("published_at"),
        })

    return {"items": items}
