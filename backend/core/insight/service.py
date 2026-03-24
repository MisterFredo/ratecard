from typing import List, Dict

from config import BQ_PROJECT, BQ_DATASET
from utils.bigquery_utils import query_bq
from utils.llm import run_llm


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
    """
    Récupère NEWS + ANALYSES (version UI)
    """

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
# FETCH ANALYSES (LLM ONLY)
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
# EMAIL (PRODUIT CORE)
# ============================================================

def format_email(items: List[Dict]) -> str:
    """
    Email premium (unique version)
    """

    if not items:
        return "Aucune sélection."

    lines = []

    lines.append("📊 Veille personnalisée")
    lines.append("")

    news = [i for i in items if i.get("type") == "news"]
    analyses = [i for i in items if i.get("type") == "analysis"]

    # --------------------------------------------------------
    # HELPERS
    # --------------------------------------------------------

    def format_date(dt):
        if not dt:
            return ""
        try:
            return dt[:10]
        except:
            return ""

    def format_badges(item):
        badges = []

        for c in item.get("companies", []):
            if c.get("name"):
                badges.append(c["name"])

        for t in item.get("topics", []):
            if t.get("label"):
                badges.append(t["label"])

        return ", ".join(badges)

    def build_block(item):
        title = (item.get("title") or "").strip()
        excerpt = (item.get("excerpt") or "").strip()
        date = format_date(item.get("published_at"))
        badges = format_badges(item)

        block = f"• {title}"

        if date:
            block += f" ({date})"

        if badges:
            block += f"\n[{badges}]"

        if excerpt:
            block += f"\n{excerpt}"

        return block

    # --------------------------------------------------------
    # NEWS
    # --------------------------------------------------------

    if news:
        lines.append("📰 News")
        lines.append("")

        for item in news:
            lines.append(build_block(item))
            lines.append("")

    # --------------------------------------------------------
    # ANALYSES
    # --------------------------------------------------------

    if analyses:
        lines.append("📈 Analyses")
        lines.append("")

        for item in analyses:
            lines.append(build_block(item))
            lines.append("")

    return "\n".join(lines).strip()


# ============================================================
# INSIGHT PAYLOAD (LLM)
# ============================================================

def build_insight_payload(items: List[Dict]) -> Dict:
    """
    Payload pour le LLM (analyses uniquement)
    """

    analysis_ids = [
        i["id"] for i in items if i.get("type") == "analysis"
    ]

    analyses = get_analysis_details_by_ids(analysis_ids)

    return {
        "type": "insight",
        "count": len(analyses),
        "analyses": analyses,
    }


# ============================================================
# LLM (PLACEHOLDER)
# ============================================================

def build_prompt(payload: Dict) -> str:
    """
    Prompt LLM — extraction structurée stricte (NO ANALYSIS)
    """

    analyses = payload.get("analyses", [])

    if not analyses:
        return "Aucune donnée."

    # --------------------------------------------------------
    # CONTEXT BUILD (RICH)
    # --------------------------------------------------------

    context_blocks = []

    for a in analyses:
        block = f"""
TITRE:
{a.get("title")}

EXCERPT:
{a.get("excerpt")}

CONTENU:
{a.get("content_body")}

MECANIQUE:
{a.get("mecanique")}

ENJEU:
{a.get("enjeu")}

FRICTION:
{a.get("friction")}

SIGNAL:
{a.get("signal")}

CHIFFRES:
{a.get("chiffres")}

CITATIONS:
{a.get("citations")}
"""
        context_blocks.append(block.strip())

    context = "\n\n====================\n\n".join(context_blocks)

    # --------------------------------------------------------
    # PROMPT
    # --------------------------------------------------------

    prompt = f"""
Tu es un assistant spécialisé dans l'extraction d'information.

OBJECTIF :
Identifier les éléments structurants présents dans les contenus.

IMPORTANT :
- Tu ne dois PAS interpréter
- Tu ne dois PAS faire de projection
- Tu ne dois PAS donner d'opinion
- Tu ne dois PAS reformuler de manière créative
- Tu dois rester STRICTEMENT fidèle aux contenus

CONTEXTE :
{context}

TÂCHE :

1. Identifier les THÈMES dominants
2. Identifier les MÉCANIQUES observées
3. Identifier les SIGNAUX récurrents
4. Identifier les POINTS DE FRICTION

FORMAT :

THÈMES
- ...

MÉCANIQUES
- ...

SIGNAUX
- ...

FRICTIONS
- ...

RÈGLES STRICTES :
- Bullet points uniquement
- Pas de phrases longues
- Pas de conclusion
- Pas de résumé global
- Pas d’interprétation
- Pas de "cela montre que"
- Pas de "tendance"

Tu es un extracteur, pas un analyste.
"""

    return prompt.strip()


def generate_insight(payload: Dict) -> str:
    """
    LLM (future implémentation)
    """

    if payload.get("count", 0) == 0:
        return "Aucune analyse disponible."

    prompt = build_prompt(payload)

    # TODO → appel OpenAI
    return "LLM_RESULT_PLACEHOLDER"


# ============================================================
# EMAIL FINAL (EMAIL + INSIGHT)
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
    """
    Pipeline complet utilisé par l'API
    """

    items = get_items_by_ids(ids)

    if not items:
        return {
            "status": "empty",
            "items": [],
            "email": "",
            "insight": "",
            "final_email": "",
        }

    # 1. EMAIL (matière)
    email = format_email(items)

    # 2. PAYLOAD LLM
    payload = build_insight_payload(items)

    # 3. INSIGHT
    insight = generate_insight(payload)

    # 4. EMAIL FINAL
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
