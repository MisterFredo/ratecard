from typing import List, Dict
from utils.bigquery_utils import query_bq
from config import BQ_PROJECT, BQ_DATASET


# ============================================================
# VIEW
# ============================================================

VIEW_NEWS = f"{BQ_PROJECT}.{BQ_DATASET}.V_NEWS_ENRICHED"


# ============================================================
# FETCH
# ============================================================

def get_news_by_ids(ids: List[str]) -> List[Dict]:
    """
    Récupère les news sélectionnées pour SCAN.
    """

    if not ids:
        return []

    rows = query_bq(
        f"""
        SELECT
            id_news,
            title,
            excerpt,
            published_at,
            news_type,
            news_kind,
            visual_rect_id,
            id_company,
            company_name,
            is_partner,
            topics
        FROM `{VIEW_NEWS}`
        WHERE id_news IN UNNEST(@ids)
        ORDER BY published_at DESC
        """,
        {"ids": ids}
    )

    return [
        {
            "id": r.get("id_news"),
            "title": r.get("title"),
            "excerpt": r.get("excerpt") or "",
            "published_at": r.get("published_at"),
            "news_type": r.get("news_type"),
            "news_kind": r.get("news_kind"),
            "visual_rect_id": r.get("visual_rect_id"),
            "company": {
                "id_company": r.get("id_company"),
                "name": r.get("company_name"),
                "is_partner": bool(r.get("is_partner")),
            },
            "topics": r.get("topics") or [],
        }
        for r in rows
    ]


# ============================================================
# FORMAT (CORE PRODUIT)
# ============================================================

def format_scan_as_text(items: List[Dict]) -> str:
    """
    Transforme les news en format texte prêt à copier
    (email / slack / doc).
    """

    if not items:
        return "Aucune actualité sélectionnée."

    BASE_URL = "https://ratecard.fr/news"

    lines = []

    # 🔹 Header
    lines.append("🗞️ Veille - Sélection personnalisée")

    # 🔹 Séparation NEWS / BRÈVES
    news_items = [i for i in items if i.get("news_kind") == "NEWS"]
    breves_items = [i for i in items if i.get("news_kind") == "BRIEF"]

    def build_block(item: Dict) -> str:
        title = (item.get("title") or "").strip()
        excerpt = (item.get("excerpt") or "").strip()
        company = item.get("company", {}).get("name")
        news_id = item.get("id")

        url = f"{BASE_URL}/{news_id}"

        # 🔹 Ligne titre
        line = f"• {title}"

        if company:
            line += f" ({company})"

        # 🔹 Bloc
        block = f"{line}\n{url}"

        if excerpt:
            block += f"\n{excerpt}"

        return block

    # 🔹 NEWS
    if news_items:
        lines.append("\n📰 News")
        for item in news_items:
            lines.append(build_block(item))

    # 🔹 BRÈVES
    if breves_items:
        lines.append("\n⚡ Brèves")
        for item in breves_items:
            lines.append(build_block(item))

    return "\n\n".join(lines)
