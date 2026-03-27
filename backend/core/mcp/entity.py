# core/mcp/entity.py

def resolve_entity(query: str):

    q = query.lower()

    if "retail media" in q:
        return {
            "type": "topic",
            "label": "Retail Media"
        }

    if "ctv" in q:
        return {
            "type": "topic",
            "label": "CTV & VIDEO"
        }

    return {
        "type": "unknown",
        "label": None
    }
