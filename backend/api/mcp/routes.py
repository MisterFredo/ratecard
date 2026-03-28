# api/mcp/query.py

from fastapi import APIRouter
from pydantic import BaseModel

# MCP core
from core.mcp.intent import detect_intent
from core.mcp.entity import resolve_entity

# 🔥 NEW : handlers
from core.mcp.handlers.numbers import handle_numbers

# (tu gardes temporairement ton analyse existante)
from core.mcp.query_builder import build_content_query
from core.mcp.response_builder import build_market_analysis_response

from utils.bigquery_utils import query_bq

router = APIRouter()


class MCPQuery(BaseModel):
    query: str


@router.post("/query")
def mcp_query(body: MCPQuery):

    user_query = body.query

    # 🔒 GPT safety
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

    if entity["type"] == "unknown":
        return {
            "status": "error",
            "message": "Entity not recognized"
        }

    # ----------------------------------
    # 🔥 3. ROUTING (NOUVEAU)
    # ----------------------------------

    # 🟠 NUMBERS (nouveau handler)
    if intent == "numbers":
        return handle_numbers(entity)

    # 🔵 ANALYSE (ancienne logique - temporaire)
    if intent == "market_analysis" and entity["type"] == "topic":

        sql = build_content_query(entity["label"])
        rows = query_bq(sql)

        if not rows:
            return {
                "status": "ok",
                "intent": intent,
                "entity": entity,
                "answer": {
                    "text": "Les signaux disponibles sont encore limités pour produire une analyse fiable.",
                    "nb_contents": 0
                }
            }

        response = build_market_analysis_response(rows)

        return {
            "status": "ok",
            "intent": intent,
            "entity": entity,
            "answer": response
        }

    # ----------------------------------
    # FALLBACK
    # ----------------------------------
    return {
        "status": "error",
        "message": "Unsupported case"
    }
