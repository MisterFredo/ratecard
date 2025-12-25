# backend/api/company/__init__.py

from fastapi import APIRouter
from backend.api.company.routes import router as company_routes

router = APIRouter(tags=["Company"])
router.include_router(company_routes)
