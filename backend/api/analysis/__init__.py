from fastapi import APIRouter
from api.analysis.routes import router as analysis_routes

router = APIRouter()
router.include_router(analysis_routes)
