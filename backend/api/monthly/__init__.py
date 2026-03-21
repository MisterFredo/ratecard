from fastapi import APIRouter
from api.monthly.routes import router as monthly_routes

router = APIRouter()
router.include_router(monthly_routes)
