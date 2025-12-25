# backend/api/company/__init__.py

from fastapi import APIRouter
from api.company.routes import router as company_routes

router = APIRouter()
router.include_router(company_routes)
