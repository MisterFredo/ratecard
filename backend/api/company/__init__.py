from fastapi import APIRouter
from .routes import router as company_routes

router = APIRouter()
router.include_router(company_routes)
