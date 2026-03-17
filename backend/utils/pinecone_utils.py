import os
from pinecone import Pinecone


def _get_pinecone_client():
    env = os.getenv("PINECONE_ENV") or os.getenv("PINECONE_ENVIRONMENT")

    if not env:
        raise ValueError("⚠️ Missing PINECONE_ENV or PINECONE_ENVIRONMENT")

    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key:
        raise ValueError("⚠️ Missing PINECONE_API_KEY")

    return Pinecone(api_key=api_key, environment=env)


def get_pinecone_index():
    pc = _get_pinecone_client()

    index_name = os.getenv("PINECONE_INDEX_NAME", "ratecard-content")

    return pc.Index(index_name)
