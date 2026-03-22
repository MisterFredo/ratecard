from fastapi import APIRouter
from api.radar.routes import router as radar_routes

router = APIRouter()
router.include_router(radar_routes)
