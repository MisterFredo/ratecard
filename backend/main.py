import os
import sys
import importlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# -------------------------------------------------------
# PATH FIX
# -------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# -------------------------------------------------------
# APP
# -------------------------------------------------------
app = FastAPI(
    title="Ratecard Backend",
    version="1.2.0",
    description="Ratecard backend API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------
# ROUTER INCLUSION HELPER
# -------------------------------------------------------
def include_router(module_path: str, prefix: str, tag: str):
    """
    Importe dynamiquement un module FastAPI et monte son router.
    Hypothèse : le module expose un attribut `router`.
    """
    mod = importlib.import_module(module_path)
    router = getattr(mod, "router")
    app.include_router(router, prefix=prefix, tags=[tag])

# -------------------------------------------------------
# MODULE REGISTRATION
# -------------------------------------------------------

# --- HEALTH
include_router("api.health", "/api/health", "HEALTH")

# --- ADMIN / PRODUCTION
include_router("api.content", "/api/content", "CONTENT")
include_router("api.news", "/api/news", "NEWS")
include_router("api.company", "/api/company", "COMPANY")
include_router("api.person", "/api/person", "PERSON")
include_router("api.topic", "/api/topic", "TOPIC")
include_router("api.event", "/api/event", "EVENT")
include_router("api.synthesis", "/api/synthesis", "SYNTHESIS")

# --- CURATOR / LECTURE (DASHBOARDS)
include_router("api.content_read", "/api/content", "CONTENT_READ")

# --- FRONT PUBLIC (MEDIA)
include_router("api.public", "/api/public", "PUBLIC")

# --- SUPPORT
include_router("api.visuals", "/api/visuals", "VISUALS")

# -------------------------------------------------------
# ROOT
# -------------------------------------------------------
@app.get("/")
def root():
    return {
        "service": "ratecard-backend",
        "status": "ok",
        "version": "1.2.0",
        "modules": [
            "content",
            "content_read",
            "news",
            "event",
            "topic",
            "company",
            "person",
            "synthesis",
            "public",
            "visuals",
        ]
    }

# -------------------------------------------------------
# ROUTES DEBUG
# -------------------------------------------------------
@app.get("/__routes")
def list_routes():
    """
    Debug helper: liste toutes les routes montées.
    Utile pour vérifier l’enregistrement Render.
    """
    return {
        "routes": [
            {
                "path": r.path,
                "methods": list(r.methods or [])
            }
            for r in app.router.routes
        ]
    }



