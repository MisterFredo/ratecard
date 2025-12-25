from fastapi import APIRouter
from api.health.routes import router as health_routes

router = APIRouter(tags=["HEALTH"])
router.include_router(health_routes)
