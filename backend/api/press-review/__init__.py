# backend/api/press-review/__init__.py

from fastapi import APIRouter
from api.press-review.routes import router as press-review_routes

router = APIRouter()
router.include_router(press-review_routes)
