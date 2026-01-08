from fastapi import APIRouter
from api.public.routes import router as public_routes

router = APIRouter()
router.include_router(public_routes)
