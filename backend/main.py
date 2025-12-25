# backend/main.py

import os
import sys

# ======================================================
# Fix import path so "api.*" modules are loadable
# ======================================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Consolidated module routers (ADEX-like)
from api.health import router as health_router
from api.articles import router as articles_router
from api.company import router as company_router
from api.person import router as person_router


# ======================================================
# FASTAPI APP
# ======================================================

app = FastAPI(
    title="Ratecard Backend",
    version="1.0.0",
    description="API Ratecard — Articles, Companies & Persons",
)


# ======================================================
# CORS
# ======================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # to restrict when FE is live
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================================
# ROUTES
# ======================================================
app.include_router(health_router,  prefix="/api/health")
app.include_router(articles_router, prefix="/api/articles")
app.include_router(company_router,  prefix="/api/company")
app.include_router(person_router,   prefix="/api/person")
