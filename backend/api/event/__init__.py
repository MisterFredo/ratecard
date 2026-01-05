from fastapi import APIRouter
from api.event.routes import router as event_routes

router = APIRouter()
router.include_router(event_routes)
