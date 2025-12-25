# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ROUTERS
from backend.api.health import router as health_router
from backend.api.articles.routes import router as articles_router
from backend.api.company.routes import router as company_router
from backend.api.person.routes import router as person_router


# ---------------------------------------------------------
# APP INIT
# ---------------------------------------------------------

app = FastAPI(
    title="Ratecard Backend",
    version="1.0.0",
    description="API Ratecard — Articles, Companies & Persons"
)


# ---------------------------------------------------------
# CORS (à affiner une fois le frontend en production)
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # TODO: restreindre à domaine front
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

# Health
app.include_router(
    health_router,
    prefix="/api/health",
    tags=["Health"]
)

# Articles
app.include_router(
    articles_router,
    prefix="/api/articles",
    tags=["Articles"]
)

# Companies (clients Ratecard)
app.include_router(
    company_router,
    prefix="/api/company",
    tags=["Company"]
)

# Persons
app.include_router(
    person_router,
    prefix="/api/person",
    tags=["Person"]
)
