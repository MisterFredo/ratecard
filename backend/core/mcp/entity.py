# core/mcp/entity.py

import unicodedata

def normalize(text: str) -> str:
    """
    Normalise le texte :
    - minuscules
    - suppression accents
    """
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()


def resolve_entity(query: str):

    q = normalize(query)

    # 🔵 TOPICS

    if "retail media" in q:
        return {
            "type": "topic",
            "label": "Retail Media"
        }

    if "ctv" in q or "video" in q:
        return {
            "type": "topic",
            "label": "CTV & VIDEO"
        }

    if "dooh" in q:
        return {
            "type": "topic",
            "label": "DOOH"
        }

    # fallback
    return {
        "type": "unknown",
        "label": None
    }
