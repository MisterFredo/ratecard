# backend/api/vector/__init__.py

from fastapi import APIRouter
from api.vector.routes import router as vector_routes

router = APIRouter()
router.include_router(vector_routes)
