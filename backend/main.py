# backend/main.py

import os
import sys
import importlib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add backend directory to Python path so "api.xxx" works
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

app = FastAPI(
    title="Ratecard Backend",
    version="1.0.0",
    description="Ratecard backend API"
)

# -------------------------------------------------------
# CORS
# -------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------
# Dynamic router loader (ADEX-like pattern)
# -------------------------------------------------------

def include_router(module_path: str, prefix: str):
    module = importlib.import_module(module_path)
    router = getattr(module, "router")
    app.include_router(router, prefix=prefix)

# -------------------------------------------------------
# Load modules
# -------------------------------------------------------
include_router("api.health", "/api/health")
include_router("api.articles", "/api/articles")
include_router("api.company", "/api/company")
include_router("api.person", "/api/person")
