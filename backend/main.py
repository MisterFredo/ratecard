# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.health import router as health_router
from backend.api.articles.routes import router as articles_router

app = FastAPI(
    title="Ratecard Backend",
    version="1.0.0",
    description="API Ratecard — base articles"
)

# CORS (à affiner quand le frontend sera en place)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES
app.include_router(health_router, prefix="/api/health", tags=["Health"])
app.include_router(articles_router, prefix="/api/articles", tags=["Articles"])
