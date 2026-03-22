from fastapi import APIRouter
from api.numbers.routes import router as numbers_routes

router = APIRouter()
router.include_router(numbers_routes)
