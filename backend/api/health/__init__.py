from fastapi import APIRouter
from .routes import router as health_routes

router = APIRouter()
router.include_router(health_routes)
