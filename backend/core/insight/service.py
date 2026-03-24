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

def build_insight_html(items, insight_text):

    def format_date(dt):
        return dt[:10] if dt else ""

    def render_badges(item):
        badges = []

        for c in item.get("companies", []):
            if c.get("name"):
                badges.append(
                    f"<span style='background:#eef2ff;color:#3730a3;padding:2px 6px;border-radius:6px;font-size:11px;margin-right:4px'>{c['name']}</span>"
                )

        for t in item.get("topics", []):
            if t.get("label"):
                badges.append(
                    f"<span style='background:#f3f4f6;color:#374151;padding:2px 6px;border-radius:6px;font-size:11px;margin-right:4px'>{t['label']}</span>"
                )

        return "".join(badges)

    html = "<div style='font-family:Arial, sans-serif;'>"

    # =====================================================
    # NEWS
    # =====================================================
    news = [i for i in items if i["type"] == "news"]

    if news:
        html += "<h2 style='margin-top:10px;'>📰 News</h2>"

        for n in news:
            html += f"""
            <div style="margin-bottom:18px;">
                <div style="font-weight:600;">
                    {n['title']} ({format_date(n.get('published_at'))})
                </div>

                <div style="margin:6px 0;">
                    {render_badges(n)}
                </div>

                <div style="color:#374151;">
                    {n.get("excerpt") or ""}
                </div>
            </div>
            """

    # =====================================================
    # ANALYSE LLM (🔥 EN PREMIER VISUELLEMENT)
    # =====================================================

    if insight_text:
        html += "<h2 style='margin-top:20px;'>🧠 Analyse</h2>"

        for line in insight_text.split("\n"):
            line = line.strip()

            if line.startswith("-"):
                html += f"""
                <div style="margin-bottom:6px;">
                    • {line.replace('-', '').strip()}
                </div>
                """

            elif line.upper() == line and len(line) < 40:
                html += f"""
                <div style="margin-top:12px;font-weight:600;">
                    {line}
                </div>
                """

    html += "</div>"

    return html


# ============================================================
# LLM (PLACEHOLDER)
# ============================================================

def build_prompt(payload: Dict) -> str:

    analyses = payload.get("analyses", [])

    if not analyses:
        return "Aucune donnée."

    context_blocks = []

    for a in analyses:
        block = f"""
TITRE:
{a.get("title")}

CONTENU:
{a.get("content_body")}

CONCEPTS:
{a.get("concepts_llm")}

CHIFFRES:
{a.get("chiffres")}

SIGNAL:
{a.get("signal")}

MECANIQUE:
{a.get("mecanique")}
"""
        context_blocks.append(block.strip())

    context = "\n\n====================\n\n".join(context_blocks)

    prompt = f"""
Tu es un assistant de SYNTHÈSE FACTUELLE pour un expert métier.

Tu travailles sur des signaux déjà structurés.
Tu ne dois PAS interpréter, tu dois STRUCTURER.

--------------------------------------------------
OBJECTIF

Faire gagner du temps à un professionnel :
→ Il ne veut PAS lire les analyses
→ Il veut les faits importants, organisés

--------------------------------------------------
MÉTHODE (OBLIGATOIRE)

1. IDENTIFIER les CONCEPTS qui reviennent le plus souvent
2. REGROUPER les analyses par CONCEPT commun
3. EXTRAIRE :
   - les faits concrets (signal / mécanique)
   - les CHIFFRES associés (si présents)
4. PRIORISER :
   - importance (fréquence + impact business)
   - pas l’ordre du texte

--------------------------------------------------
CONTEXTE
{context}

--------------------------------------------------
TÂCHE

Produire EXACTEMENT 5 points clés.

Chaque point doit :
- correspondre à un CONCEPT RÉCURRENT
- agréger plusieurs analyses
- contenir :
    • un fait concret (signal ou mécanique)
    • au moins 1 chiffre SI disponible
- être immédiatement exploitable

--------------------------------------------------
FORMAT STRICT (OBLIGATOIRE)

POINTS CLÉS

- [CONCEPT] → fait synthétique + chiffre

- ...

--------------------------------------------------
EXEMPLES DE BON OUTPUT

- [Retail media domination] → Amazon capte 75% du marché US, confirmant une concentration extrême des budgets.

- [Shift vers le conversational commerce] → Lemrock lève 6M€ pour connecter marques et agents IA, dans un contexte de baisse du trafic e-commerce.

--------------------------------------------------
RÈGLES STRICTES

- MAX 5 points
- PAS de phrase longue
- PAS de résumé d’article
- PAS de storytelling
- PAS de généralité ("le marché évolue")
- PAS de contenu isolé
- PAS d’invention

INTERDIT :
❌ "plusieurs analyses montrent que..."
❌ "une tendance semble émerger"
❌ "cela pourrait"

AUTORISÉ :
✅ faits
✅ chiffres
✅ regroupement

--------------------------------------------------

Tu dois AGIR comme un filtre, pas comme un analyste.
"""
    return prompt.strip()


def generate_insight(payload: Dict) -> str:
    """
    Génération insight LLM (extraction stricte)
    """

    if payload.get("count", 0) == 0:
        return "Aucune analyse disponible."

    prompt = build_prompt(payload)

    result = run_llm(
        prompt=prompt,
        temperature=0.2,  # 🔥 très important
    )

    # sécurité fallback
    if not result:
        return "Impossible de générer l'insight."

    return result


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
