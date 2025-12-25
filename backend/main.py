# backend/main.py

import os
import sys
import importlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend is in PYTHONPATH
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)


app = FastAPI(
    title="Ratecard Backend",
    description="Ratecard API — articles, companies, persons",
    version="1.0.0"
)

# --------------------
# CORS
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Helper to include routers dynamically like in ADEX
# ============================================================

def include_router(module_path: str, prefix: str):
    """
    Load module.api.<name> dynamically like ADEX to avoid import issues.
    """
    mod = importlib.import_module(module_path)
    router = getattr(mod, "router")
    app.include_router(router, prefix=prefix)


# ============================================================
# Load modules (exactly like ADEX-backend V3, but simplified)
# ============================================================

include_router("api.health", "/api/health")
include_router("api.articles", "/api/articles")
include_router("api.company", "/api/company")
include_router("api.person", "/api/person")
