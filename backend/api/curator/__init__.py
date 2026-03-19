from fastapi import APIRouter
from api.curator.routes import router as curator_routes

router = APIRouter()
router.include_router(curator_routes)
