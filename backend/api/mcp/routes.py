# api/mcp/query.py

from fastapi import APIRouter
from pydantic import BaseModel

from core.mcp.intent import detect_intent
from core.mcp.entity import resolve_entity
from core.mcp.query_builder import build_content_query
from core.mcp.response_builder import build_market_analysis_response

from utils.bigquery_utils import query_bq

router = APIRouter()

class MCPQuery(BaseModel):
    query: str

@router.post("/query")
def mcp_query(body: MCPQuery):

    user_query = body.query

    # 1. Intent
    intent = detect_intent(user_query)

    # 2. Entity
    entity = resolve_entity(user_query)

    # 3. Routing (V1 simple)
    if intent == "market_analysis" and entity["type"] == "topic":

        sql = build_content_query(entity["label"])

        rows = query_bq(sql)

        response = build_market_analysis_response(rows)

        return {
            "status": "ok",
            "intent": intent,
            "entity": entity,
            "answer": response
        }

    return {
        "status": "error",
        "message": "Unsupported case"
    }
