import os
from pinecone import Pinecone


# ============================================================
# ENABLE FLAG
# ============================================================

def is_pinecone_enabled() -> bool:
    """
    Permet d’activer / désactiver Pinecone via variable d’environnement.
    """
    return os.getenv("ENABLE_PINECONE", "1").lower() in {"1", "true", "yes", "on"}


# ============================================================
# CLIENT
# ============================================================

def _get_pinecone_client():
    env = os.getenv("PINECONE_ENV") or os.getenv("PINECONE_ENVIRONMENT")

    if not env:
        raise ValueError("⚠️ PINECONE_ENV ou PINECONE_ENVIRONMENT manquant")

    return Pinecone(
        api_key=os.getenv("PINECONE_API_KEY"),
        environment=env
    )


# ============================================================
# INDEX
# ============================================================

def get_pinecone_index():
    pc = _get_pinecone_client()
    index_name = os.getenv("PINECONE_INDEX_NAME", "ratecard-content")
    return pc.Index(index_name)
