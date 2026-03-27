@router.post("/query")
def mcp_query(body: MCPQuery):

    user_query = body.query

    # 🔒 GPT safety
    if "call the" in user_query.lower():
        return {
            "status": "error",
            "message": "Invalid query"
        }

    # 1. Intent
    intent = detect_intent(user_query)

    # 2. Entity
    entity = resolve_entity(user_query)

    if entity["type"] == "unknown":
        return {
            "status": "error",
            "message": "Entity not recognized"
        }

    # 3. Routing
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

    return {
        "status": "error",
        "message": "Unsupported case"
    }
