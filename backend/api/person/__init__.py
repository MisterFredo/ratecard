# backend/api/person/__init__.py

from fastapi import APIRouter
from api.person.routes import router as person_routes

router = APIRouter()
router.include_router(person_routes)
