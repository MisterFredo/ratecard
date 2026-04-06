# backend/api/universe/__init__.py

from fastapi import APIRouter
from api.universe.routes import router as universe_routes

router = APIRouter()
router.include_router(universe_routes)
