from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq


# ============================================================
# TABLES / VIEWS
# ============================================================

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"
VIEW_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.V_CONTENT_ENRICHED"

TABLE_CONTENT = f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_CONTENT"


# ============================================================
# FETCH (UI / EMAIL)
# ============================================================

def get_items_by_ids(ids: List[str]) -> List[Dict]:

    if not ids:
        return []

    sql = f"""
    -- NEWS
    SELECT
        n.id_news AS id,
        'news' AS type,
        n.title,
        n.excerpt,
        n.published_at,
        n.news_type,
        n.topics,
        ARRAY<STRUCT<id_company STRING, name STRING>>[
          STRUCT(n.id_company, n.company_name)
        ] AS companies,
        [] AS solutions

    FROM `{VIEW_NEWS}` n
    WHERE n.id_news IN UNNEST(@ids)

    UNION ALL

    -- ANALYSES
    SELECT
        c.id_content AS id,
        'analysis' AS type,
        c.title,
        c.excerpt,
        c.published_at,
        NULL AS news_type,
        c.topics,
        c.companies,
        c.solutions

    FROM `{VIEW_CONTENT}` c
    WHERE c.id_content IN UNNEST(@ids)

    ORDER BY published_at DESC
    """

    rows = query_bq(sql, {"ids": ids})

    return [_map_feed_row(r) for r in rows]


# ============================================================
# FETCH ANALYSES (RICH → LLM)
# ============================================================

def get_analysis_details_by_ids(ids: List[str]) -> List[Dict]:
    """
    Récupère les analyses enrichies pour le LLM.
    """

    if not ids:
        return []

    rows = query_bq(
        f"""
        SELECT
          ID_CONTENT,
          TITLE,
          EXCERPT,
          CONTENT_BODY,
          MECANIQUE_EXPLIQUEE,
          ENJEU_STRATEGIQUE,
          POINT_DE_FRICTION,
          SIGNAL_ANALYTIQUE,
          CHIFFRES,
          CITATIONS
        FROM `{TABLE_CONTENT}`
        WHERE ID_CONTENT IN UNNEST(@ids)
        """,
        {"ids": ids}
    )

    return [
        {
            "id": r["ID_CONTENT"],
            "title": r.get("TITLE"),
            "excerpt": r.get("EXCERPT"),
            "content_body": r.get("CONTENT_BODY"),
            "mecanique": r.get("MECANIQUE_EXPLIQUEE"),
            "enjeu": r.get("ENJEU_STRATEGIQUE"),
            "friction": r.get("POINT_DE_FRICTION"),
            "signal": r.get("SIGNAL_ANALYTIQUE"),
            "chiffres": r.get("CHIFFRES") or [],
            "citations": r.get("CITATIONS") or [],
        }
        for r in rows
    ]


# ============================================================
# FORMAT EMAIL (MATIÈRE)
# ============================================================

def format_items_as_email(items: List[Dict]) -> str:

    if not items:
        return "Aucun contenu sélectionné."

    lines = []
    lines.append("🗞️ Veille - Sélection personnalisée")

    def format_date(dt):
        return str(dt)[:10] if dt else ""

    def build_block(item):

        date = format_date(item.get("published_at"))
        title = (item.get("title") or "").strip()
        excerpt = (item.get("excerpt") or "").strip()

        companies = [c.get("name") for c in item.get("companies", [])]
        topics = [t.get("label") for t in item.get("topics", [])]

        badges = " | ".join(filter(None, companies + topics))

        header = f"[{date}]"
        if badges:
            header += f" {badges}"

        block = f"{header}\n{title}"

        if excerpt:
            block += f"\n{excerpt}"

        return block

    for item in items:
        lines.append(build_block(item))

    return "\n\n".join(lines)


# ============================================================
# BUILD INSIGHT PAYLOAD
# ============================================================

def build_insight_payload(items: List[Dict]) -> Dict:
    """
    Payload enrichi pour LLM (analyses uniquement)
    """

    analysis_ids = [
        i["id"] for i in items if i.get("type") == "analysis"
    ]

    analyses = get_analysis_details_by_ids(analysis_ids)

    return {
        "type": "insight",
        "count": len(analyses),
        "analyses": analyses
    }


# ============================================================
# LLM (PLACEHOLDER)
# ============================================================

def build_prompt(payload: Dict) -> str:
    return "PROMPT_PLACEHOLDER"


def generate_insight(payload: Dict) -> str:

    if payload.get("count", 0) == 0:
        return "Aucune analyse disponible."

    prompt = build_prompt(payload)

    return "LLM_RESULT_PLACEHOLDER"


# ============================================================
# FINAL EMAIL
# ============================================================

def format_email_with_insight(base_email: str, insight: str) -> str:

    if not insight:
        return base_email

    return f"""
{base_email}

---

🧠 Analyse

{insight}
""".strip()


# ============================================================
# PIPELINE
# ============================================================

def run_insight_pipeline(ids: List[str]) -> Dict:

    items = get_items_by_ids(ids)

    if not items:
        return {
            "status": "empty",
            "items": [],
            "email": "",
            "insight": "",
            "final_email": "",
        }

    email = format_items_as_email(items)

    payload = build_insight_payload(items)

    insight = generate_insight(payload)

    final_email = format_email_with_insight(email, insight)

    return {
        "status": "ok",
        "items": items,
        "email": email,
        "insight": insight,
        "final_email": final_email,
    }


# ============================================================
# MAPPER
# ============================================================

def _map_feed_row(r: Dict) -> Dict:

    def map_dt(value):
        return value.isoformat() if value else None

    return {
        "id": r.get("id"),
        "type": r.get("type"),
        "title": r.get("title"),
        "excerpt": r.get("excerpt"),
        "published_at": map_dt(r.get("published_at")),
        "news_type": r.get("news_type"),
        "topics": r.get("topics") or [],
        "companies": r.get("companies") or [],
        "solutions": r.get("solutions") or [],
    }
