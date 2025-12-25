# backend/api/person/__init__.py

from fastapi import APIRouter
from backend.api.person.routes import router as person_routes

router = APIRouter(tags=["Person"])
router.include_router(person_routes)
