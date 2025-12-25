# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Consolidated Routers (ADEX-like)
from backend.api.health import router as health_router
from backend.api.articles import router as articles_router
from backend.api.company import router as company_router
from backend.api.person import router as person_router


app = FastAPI(
    title="Ratecard Backend",
    version="1.0.0",
    description="API Ratecard — Articles, Companies & Persons"
)


# ----------------------------
# CORS (simple for now)
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# ROUTES
# ----------------------------
app.include_router(health_router,  prefix="/api/health")
app.include_router(articles_router, prefix="/api/articles")
app.include_router(company_router,  prefix="/api/company")
app.include_router(person_router,   prefix="/api/person")

