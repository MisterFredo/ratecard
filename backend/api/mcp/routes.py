from fastapi import APIRouter
from pydantic import BaseModel

# MCP core
from core.mcp.intent import detect_intent
from core.mcp.entity import resolve_entity

# handlers
from core.mcp.handlers.topic import handle_topic
from core.mcp.handlers.company import handle_company
from core.mcp.handlers.numbers import handle_numbers
from core.mcp.handlers.benchmark import handle_benchmark

# moteur
from core.curator.service import search

# insight + suggestions
from core.insight.service import run_insight_pipeline
from core.mcp.suggestions import build_suggestions

router = APIRouter()


# ============================================================
# MODEL
# ============================================================

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
# 🧠 DECISION ENGINE (STABLE)
# ============================================================

def decide_route(intent, entity, rows, query):

    # benchmark
    if intent == "benchmark":
        return "benchmark"

    # numbers
    if intent == "numbers":
        return "numbers"

    # 🔥 entity uniquement si query simple (critique)
    if entity["type"] in ["company", "topic"] and len(query.split()) <= 2:
        return entity["type"]

    # search sinon
    if rows:
        return "search"

    return "search"


# ============================================================
# ROUTE
# ============================================================

@router.post("/query")
def mcp_query(body: MCPQuery):

    user_query = body.query

    # ----------------------------------------------------------
    # SAFETY
    # ----------------------------------------------------------
    if "call the" in user_query.lower():
        return {
            "status": "error",
            "message": "Invalid query"
        }

    # ----------------------------------------------------------
    # CLEAN
    # ----------------------------------------------------------
    cleaned_query = clean_query(user_query)
    search_query = cleaned_query if cleaned_query else user_query

    # ----------------------------------------------------------
    # SEARCH FIRST (important)
    # ----------------------------------------------------------
    rows = search(q=search_query, limit=10) or []

    if not rows and cleaned_query != user_query:
        rows = search(q=user_query, limit=10) or []

    # enrich URLs
    for item in rows:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

    # ----------------------------------------------------------
    # INTENT + ENTITY
    # ----------------------------------------------------------
    intent = detect_intent(user_query)
    entity = resolve_entity(user_query)

    # ----------------------------------------------------------
    # DECISION
    # ----------------------------------------------------------
    decision = decide_route(intent, entity, rows, user_query)

    # ----------------------------------------------------------
    # ROUTING
    # ----------------------------------------------------------

    # BENCHMARK
    if decision == "benchmark":
        return handle_benchmark(user_query)

    # NUMBERS (avec fallback 🔥)
    if decision == "numbers":
        result = handle_numbers(entity)

        if result.get("status") == "empty":
            decision = "search"
        else:
            return result

    # COMPANY
    if decision == "company":
        return handle_company(entity)

    # TOPIC
    if decision == "topic":
        return handle_topic(entity)

    # ----------------------------------------------------------
    # SEARCH FALLBACK
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

    # ----------------------------------------------------------
    # INSIGHT
    # ----------------------------------------------------------

    analysis_ids = [
        r["id"]
        for r in rows
        if r.get("type") == "analysis"
    ]

    analysis_text = None

    if analysis_ids:
        result = run_insight_pipeline(analysis_ids)
        analysis_text = result.get("insight")

    # ----------------------------------------------------------
    # SUGGESTIONS
    # ----------------------------------------------------------

    suggestions = build_suggestions(
        intent="search",
        entity={"label": user_query},
        items=rows
    )

    # ----------------------------------------------------------
    # RESPONSE
    # ----------------------------------------------------------

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
