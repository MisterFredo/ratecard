from fastapi import APIRouter
from .routes import router as person_routes

router = APIRouter()
router.include_router(person_routes)
