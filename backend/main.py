# backend/main.py

import os
import sys
import importlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# PYTHONPATH FIX (ADEX-LIKE)
# ============================================================
# Permet d'importer api.*, core.*, utils.*, config
# quand Docker copie backend/* directement dans /app
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
    allow_origins=["*"],    # À restreindre lorsque le front sera en production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTER LOADER (ADEX V3 STYLE)
# ============================================================
def include_router(module_path: str, prefix: str, tag: str):
    """
    Dynamically load an API module exposing a `router` attr.
    ADEX V3 pattern: importlib + mounted routers for modular backend.
    """
    mod = importlib.import_module(module_path)
    router = getattr(mod, "router")
    app.include_router(router, prefix=prefix, tags=[tag])


# ============================================================
# MODULES (ADEX-LIKE REGISTRATION)
# ============================================================
include_router("api.health", "/api/health", "HEALTH")
include_router("api.articles", "/api/articles", "ARTICLES")
include_router("api.company", "/api/company", "COMPANY")
include_router("api.person", "/api/person", "PERSON")
include_router("api.lab_light", "/api/lab-light", "LAB-LIGHT")


# ============================================================
# ROOT ENDPOINT (ADEX STYLE)
# ============================================================
@app.get("/")
def root():
    return {
        "service": "ratecard-backend",
        "status": "ok",
        "endpoints": {
            "health": "/api/health/",
            "routes": "/__routes",
            "articles": "/api/articles/",
            "company": "/api/company/",
            "person": "/api/person/",
            "lab_light": "/api/lab-light/transform"
        }
    }


# ============================================================
# DEBUG ROUTES LISTING (ADEX STYLE)
# ============================================================
@app.get("/__routes")
def list_routes():
    routes = []
    for r in app.router.routes:
        routes.append({
            "path": r.path,
            "name": r.name,
            "methods": list(r.methods or [])
        })
    return {"routes": routes}

