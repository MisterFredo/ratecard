# backend/main.py

import os
import sys
import importlib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# 🔧 PREPARE PYTHONPATH (ADEX-STYLE)
# ============================================================
# Add backend/ directory to sys.path so "api.xxx" and "core.xxx" import cleanly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)


# ============================================================
# 🚀 FASTAPI APP
# ============================================================
app = FastAPI(
    title="Ratecard Backend",
    description="Ratecard backend API — Articles, Companies, Persons",
    version="1.0.0",
)


# ============================================================
# 🌐 CORS
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # replace later with your FE domain
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 🔗 ROUTER LOADER (ADEX-STYLE)
# ============================================================
def include_router(module_path: str, prefix: str, tag: str):
    """
    Dynamically load module api.<module> and include its router.
    Exactly like ADEX backend V3, but simplified.
    """
    module = importlib.import_module(module_path)
    router = getattr(module, "router")
    app.include_router(router, prefix=prefix, tags=[tag])


# ============================================================
# 📦 REGISTER MODULE ROUTERS
# ============================================================
include_router("api.health",   "/api/health",   "HEALTH")
include_router("api.articles", "/api/articles", "ARTICLES")
include_router("api.company",  "/api/company",  "COMPANY")
include_router("api.person",   "/api/person",   "PERSON")
