# backend/api/concept/__init__.py

from fastapi import APIRouter
from api.concept.routes import router as concept_routes

router = APIRouter()
router.include_router(concept_routes)
