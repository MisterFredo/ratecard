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
    version="1.1.0",
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
    mod = importlib.import_module(module_path)
    router = getattr(mod, "router")
    app.include_router(router, prefix=prefix, tags=[tag])

# -------------------------------------------------------
# MODULE REGISTRATION
# -------------------------------------------------------
include_router("api.health", "/api/health", "HEALTH")

# --- NOUVEAU CŒUR
include_router("api.content", "/api/content", "CONTENT")
include_router("api.news", "/api/news", "NEWS")
include_router("api.company", "/api/company", "COMPANY")
include_router("api.person", "/api/person", "PERSON")
include_router("api.topic", "/api/topic", "TOPIC")
include_router("api.event", "/api/event", "EVENT")

# --- FRONT PUBLIC
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
        "modules": [
            "content",
            "news",
            "event",
            "topic",
            "company",
            "person",
            "visuals",
            "public",
        ]
    }

# -------------------------------------------------------
# ROUTES DEBUG
# -------------------------------------------------------
@app.get("/__routes")
def list_routes():
    return {
        "routes": [
            {"path": r.path, "methods": list(r.methods or [])}
            for r in app.router.routes
        ]
    }


