# backend/api/scan/__init__.py

from fastapi import APIRouter
from api.scan.routes import router as scan_routes

router = APIRouter()
router.include_router(scan_routes)
