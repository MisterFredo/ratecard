from fastapi import APIRouter
from pydantic import BaseModel

# MCP core
from core.mcp.intent import detect_intent
from core.mcp.entity import resolve_entity

# handlers
from core.mcp.handlers.feed import handle_feed
from core.mcp.handlers.topic import handle_topic
from core.mcp.handlers.company import handle_company
from core.mcp.handlers.numbers import handle_numbers

# fallback
from core.feed.service import search_text
from core.insight.service import run_insight_pipeline
from core.mcp.suggestions import build_suggestions

router = APIRouter()


class MCPQuery(BaseModel):
    query: str


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
    # 1. INTENT
    # ----------------------------------------------------------
    intent = detect_intent(user_query)

    # ----------------------------------------------------------
    # 2. ENTITY
    # ----------------------------------------------------------
    entity = resolve_entity(user_query)

    # ----------------------------------------------------------
    # 🟢 FEED
    # ----------------------------------------------------------
    if intent == "feed":
        return handle_feed(entity, user_query)

    # ----------------------------------------------------------
    # 🟡 NUMBERS
    # ----------------------------------------------------------
    if intent == "numbers":
        return handle_numbers(entity)

    # ----------------------------------------------------------
    # 🔵 TOPIC (analyse marché)
    # ----------------------------------------------------------
    if intent == "topic":
        return handle_topic(entity)

    # ----------------------------------------------------------
    # 🔴 ENTITY (company / topic / unknown)
    # ----------------------------------------------------------
    if intent == "entity":

        # ✅ COMPANY
        if entity["type"] == "company":
            return handle_company(entity)

        # ✅ TOPIC
        if entity["type"] == "topic":
            return handle_topic(entity)

        # 🔥 UNKNOWN → fallback search
        if entity["type"] == "unknown":

            rows = search_text(query=user_query, limit=10) or []

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

            # 👉 ajout URL
            for item in rows:
                if item.get("type") == "news":
                    item["url"] = f"/news/{item.get('id')}"
                else:
                    item["url"] = f"/analysis/{item.get('id')}"

            # 👉 analyse
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

    # ----------------------------------------------------------
    # 🔥 FALLBACK GLOBAL (ULTIME SÉCURITÉ)
    # ----------------------------------------------------------
    rows = search_text(query=user_query, limit=10) or []

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

    for item in rows:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

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
            "analysis": None
        },
        "meta": {
            "suggestions": suggestions
        }
    }
