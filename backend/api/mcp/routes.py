from fastapi import APIRouter
from pydantic import BaseModel

# MCP core
from core.mcp.intent import detect_intent
from core.mcp.entity import resolve_entity

# handlers enrichissement
from core.mcp.handlers.topic import handle_topic
from core.mcp.handlers.company import handle_company
from core.mcp.handlers.numbers import handle_numbers
from core.mcp.handlers.benchmark import handle_benchmark

# ✅ moteur unique
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
# 🧠 DECISION ENGINE (V1 SIMPLE)
# ============================================================

def decide_route(intent, entity, rows, query):

    # --------------------------------------------------
    # 🔴 PRIORITÉ 1 → BENCHMARK
    # --------------------------------------------------
    if intent == "benchmark":
        return "benchmark"

    # --------------------------------------------------
    # 🟡 PRIORITÉ 2 → NUMBERS
    # --------------------------------------------------
    if intent == "numbers":
        return "numbers"

    # --------------------------------------------------
    # 🔵 PRIORITÉ 3 → ENTITY (topic / company)
    # --------------------------------------------------
    if entity["type"] in ["company", "topic"]:
        return entity["type"]

    # --------------------------------------------------
    # 🟢 PRIORITÉ 4 → SEARCH SI CONTENU
    # --------------------------------------------------
    if rows:
        return "search"

    # --------------------------------------------------
    # ⚪ FALLBACK
    # --------------------------------------------------
    return "search"


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
    # 1. CLEAN
    # ----------------------------------------------------------
    cleaned_query = clean_query(user_query)
    search_query = cleaned_query if cleaned_query else user_query

    # ----------------------------------------------------------
    # 2. SEARCH (ROBUSTE)
    # ----------------------------------------------------------
    rows = search(q=search_query, limit=10) or []

    # 👉 fallback si clean casse le search
    if not rows and cleaned_query != user_query:
        rows = search(q=user_query, limit=10) or []

    # 👉 enrichir URLs
    for item in rows:
        if item.get("type") == "news":
            item["url"] = f"/news/{item.get('id')}"
        else:
            item["url"] = f"/analysis/{item.get('id')}"

    # ----------------------------------------------------------
    # 3. INTENT + ENTITY
    # ----------------------------------------------------------
    intent = detect_intent(user_query)
    entity = resolve_entity(user_query)

    # ----------------------------------------------------------
    # 4. DECISION
    # ----------------------------------------------------------
    decision = decide_route(intent, entity, rows, user_query)

    # ----------------------------------------------------------
    # 5. ROUTING
    # ----------------------------------------------------------

    if decision == "benchmark":
        return handle_benchmark(user_query)

    if decision == "numbers":
        return handle_numbers(entity)

    if decision == "company":
        return handle_company(entity)

    if decision == "topic":
        return handle_topic(entity)

    # ----------------------------------------------------------
    # 6. SEARCH FALLBACK
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
    # 7. INSIGHT (ANALYSES)
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
    # 8. SUGGESTIONS
    # ----------------------------------------------------------

    suggestions = build_suggestions(
        intent="search",
        entity={"label": user_query},
        items=rows
    )

    # ----------------------------------------------------------
    # 9. RESPONSE
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
