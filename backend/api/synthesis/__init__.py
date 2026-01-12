# backend/api/synthesis/__init__.py

from fastapi import APIRouter
from api.synthesis.routes import router as synthesis_routes

router = APIRouter()
router.include_router(synthesis_routes)
