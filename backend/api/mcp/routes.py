from fastapi import APIRouter
from pydantic import BaseModel

# MCP core
from core.mcp.intent import detect_intent
from core.mcp.entity import resolve_entity

# handlers enrichissement
from core.mcp.handlers.topic import handle_topic
from core.mcp.handlers.company import handle_company
from core.mcp.handlers.numbers import handle_numbers

# ✅ moteur unique
from core.curator.service import search

# insight + suggestions
from core.insight.service import run_insight_pipeline
from core.mcp.suggestions import build_suggestions

router = APIRouter()


class MCPQuery(BaseModel):
    query: str


# ============================================================
# CLEAN QUERY
# ============================================================

def clean_query(q: str) -> str:

    q = q.lower()

    noise = [
        "👉",
        "comprendre",
        "analyse",
        "donne moi",
        "parle moi de",
        "je veux",
        "explique",
        "c est quoi",
        "c'est quoi"
    ]

    for n in noise:
        q = q.replace(n, "")

    return q.strip()


# ============================================================
# ROUTE
# ============================================================

@router.post("/query")
def mcp_query(body: MCPQuery):

    user_query = body.query

    # ----------------------------------------------------------
    # 🔒 SAFETY
    # ----------------------------------------------------------
    if "call the" in user_query.lower():
        return {
            "status": "error",
            "message": "Invalid query"
        }

    # ----------------------------------------------------------
    # 1. SEARCH FIRST (ROBUSTE)
    # ----------------------------------------------------------

    cleaned_query = clean_query(user_query)

    # 👉 sécurité : éviter query vide
    search_query = cleaned_query if cleaned_query else user_query

    rows = search(q=search_query, limit=10) or []

    # 👉 fallback si clean a cassé le search
    if not rows and cleaned_query != user_query:
        rows = search(q=user_query, limit=10) or []

    # 👉 enrichir URLs
    for item in rows:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

    # ----------------------------------------------------------
    # 2. ENTITY
    # ----------------------------------------------------------
    entity = resolve_entity(user_query)

    # ----------------------------------------------------------
    # 3. ENRICHISSEMENT (SI ENTITY CLAIRE)
    # ----------------------------------------------------------

    # 🔥 ENTITY uniquement si requête simple
    query_words = user_query.strip().split()

    if len(query_words) == 1:

    if entity["type"] == "company":
        return handle_company(entity)

    if entity["type"] == "topic":
        return handle_topic(entity)


    # ----------------------------------------------------------
    # 4. NUMBERS (INTENT SPÉCIFIQUE)
    # ----------------------------------------------------------
    intent = detect_intent(user_query)

    if intent == "numbers":
        return handle_numbers(entity)

    # ----------------------------------------------------------
    # 5. FALLBACK INTELLIGENT
    # ----------------------------------------------------------

    if not rows:
        return {
            "status": "ok",
            "intent": "search",
            "entity": {
                "type": "text",
                "label": user_query
            },
            "answer": {
                "text": f"Aucun contenu direct trouvé pour {user_query}, mais le sujet semble émergent.",
                "items": []
            }
        }

    # 👉 insight si analyses
    analysis_ids = [
        r["id"]
        for r in rows
        if r.get("type") == "analysis"
    ]

    analysis_text = None

    if analysis_ids:
        result = run_insight_pipeline(analysis_ids)
        analysis_text = result.get("insight")

    # 👉 suggestions
    suggestions = build_suggestions(
        intent="search",
        entity={"label": user_query},
        items=rows
    )

    return {
        "status": "ok",
        "intent": "search",
        "entity": {
            "type": "text",
            "label": user_query
        },
        "answer": {
            "items": rows,
            "analysis": analysis_text
        },
        "meta": {
            "suggestions": suggestions
        }
    }
