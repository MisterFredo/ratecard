from fastapi import APIRouter
from api.matching.routes import router as matching_routes

router = APIRouter()
router.include_router(matching_routes)
