# backend/api/lab_light/__init__.py

from fastapi import APIRouter
from api.lab_light.routes import router as lab_routes

router = APIRouter()
router.include_router(lab_routes)
