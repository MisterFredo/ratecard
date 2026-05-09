# backend/api/insight/__init__.py

from fastapi import APIRouter
from api.insight.routes import router as insight_routes

router = APIRouter()
router.include_router(insight_routes)
