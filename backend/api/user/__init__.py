# backend/api/user/__init__.py

from fastapi import APIRouter
from api.user.routes import router as user_routes

router = APIRouter()
router.include_router(user_routes)
