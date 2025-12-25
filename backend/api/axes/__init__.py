from fastapi import APIRouter
from api.axes.routes import router as axes_routes

router = APIRouter()
router.include_router(axes_routes)
