from fastapi import APIRouter
from pydantic import BaseModel

# MCP core
from core.mcp.intent import detect_intent
from core.mcp.entity import resolve_entity

# 🔥 handlers
from core.mcp.handlers.feed import handle_feed
from core.mcp.handlers.analysis import handle_analysis
from core.mcp.handlers.numbers import handle_numbers
from core.mcp.handlers.radar import handle_radar
from core.mcp.handlers.company import handle_company
from core.mcp.handlers.topic import handle_topic

# services
from core.feed.service import search_text
from core.insight.service import run_insight_pipeline

router = APIRouter()


class MCPQuery(BaseModel):
    query: str


@router.post("/query")
def mcp_query(body: MCPQuery):

    user_query = body.query

    # 🔒 sécurité simple
    if "call the" in user_query.lower():
        return {
            "status": "error",
            "message": "Invalid query"
        }

    # ----------------------------------
    # 1. INTENT
    # ----------------------------------
    intent = detect_intent(user_query)

    # ----------------------------------
    # 2. ENTITY
    # ----------------------------------
    entity = resolve_entity(user_query)

    # ----------------------------------
    # 🔥 3. ROUTING PRINCIPAL
    # ----------------------------------

    if intent == "feed":
        return handle_feed(entity, user_query)

    if intent == "analysis":
        return handle_analysis(entity, user_query)

    if intent == "numbers":
        return handle_numbers(entity)

    if intent == "understand":
        return handle_radar(entity)

    if intent == "company":
        return handle_company(entity)

    if intent == "topic":
        return handle_topic(entity)

    # ----------------------------------
    # 🔥 4. FALLBACK → SEARCH TEXT
    # ----------------------------------

    rows = search_text(query=user_query, limit=10)

    if not rows:
        return {
            "status": "empty",
            "intent": "search",
            "entity": {
                "type": "text",
                "label": user_query
            },
            "answer": {
                "items": []
            }
        }

    # 👉 ids analyses uniquement
    analysis_ids = [
        r["id"]
        for r in rows
        if r.get("type") == "analysis"
    ]

    analysis = None

    if analysis_ids:
        result = run_insight_pipeline(analysis_ids)
        analysis = result.get("insight")

    # 👉 ajout URL (important pour UX GPT)
    for item in rows:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

    # 👉 suggestions simples
    suggestions = [
        "Analyse les tendances CTV",
        "Donne-moi les chiffres Amazon",
        "Que fait Criteo en ce moment ?"
    ]

    return {
        "status": "ok",
        "intent": "search",
        "entity": {
            "type": "text",
            "label": user_query
        },
        "answer": {
            "items": rows,
            "analysis": analysis
        },
        "meta": {
            "suggestions": suggestions
        }
    }
