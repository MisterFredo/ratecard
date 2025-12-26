from fastapi import APIRouter
from api.axes.routes import router as axes_router

router = APIRouter()
router.include_router(axes_router)
