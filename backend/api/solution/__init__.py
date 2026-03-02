# backend/api/solution/__init__.py

from fastapi import APIRouter
from api.solution.routes import router as solution_routes

router = APIRouter()
router.include_router(solution_routes)
