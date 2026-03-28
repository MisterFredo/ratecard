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

router = APIRouter()


class MCPQuery(BaseModel):
    query: str


@router.post("/query")
def mcp_query(body: MCPQuery):

    user_query = body.query

    # --------------------------------------------------
    # 🔒 SAFETY
    # --------------------------------------------------
    if "call the" in user_query.lower():
        return {
            "status": "error",
            "message": "Invalid query"
        }

    # --------------------------------------------------
    # 1. INTENT
    # --------------------------------------------------
    intent = detect_intent(user_query)

    # --------------------------------------------------
    # 2. ENTITY
    # --------------------------------------------------
    entity = resolve_entity(user_query)

    # 👉 IMPORTANT : on ne bloque plus ici

    # --------------------------------------------------
    # 3. ROUTING
    # --------------------------------------------------

    try:

        # 🟢 FEED (quoi de neuf)
        if intent == "feed":
            return handle_feed(entity, user_query)

        # 🔵 ANALYSE (comprendre ce qui se passe récemment)
        if intent == "analysis":
            return handle_analysis(entity, user_query)

        # 🟠 NUMBERS (chiffres)
        if intent == "numbers":
            return handle_numbers(entity)

        # 🟣 UNDERSTAND (radar)
        if intent == "understand":
            return handle_radar(entity)

        # 🟡 COMPANY (snapshot entreprise)
        if intent == "company":
            return handle_company(entity)

        # 🔴 TOPIC (lecture marché structurée)
        if intent == "topic":
            return handle_topic(entity)

        # --------------------------------------------------
        # 🔥 FALLBACK GLOBAL (ULTRA IMPORTANT)
        # --------------------------------------------------

        return handle_feed(entity, user_query)

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }
