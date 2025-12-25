# backend/main.py

import os
import sys
import importlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ============================================================
# PYTHON PATH FIX (ADEX V3 STYLE)
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # /app
sys.path.insert(0, BASE_DIR)


# ============================================================
# FASTAPI APP
# ============================================================
app = FastAPI(
    title="Ratecard Backend",
    version="1.0.0",
    description="Ratecard backend API"
)


# ============================================================
# CORS
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ADEX-LIKE ROUTER LOADER
# ============================================================
def include_router(module_path: str, prefix: str, tag: str):
    """
    Load a router from an API module.
    Example: include_router("api.articles", "/api/articles", "ARTICLES")
    """
    mod = importlib.import_module(module_path)
    router = getattr(mod, "router")
    app.include_router(router, prefix=prefix, tags=[tag])


# ============================================================
# MODULE REGISTRATION
# ============================================================
include_router("api.health", "/api/health", "HEALTH")
include_router("api.articles", "/api/articles", "ARTICLES")
include_router("api.company", "/api/company", "COMPANY")
include_router("api.person", "/api/person", "PERSON")
