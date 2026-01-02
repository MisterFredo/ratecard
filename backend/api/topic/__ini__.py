# backend/api/topic/__init__.py

from fastapi import APIRouter
from api.topic.routes import router as topic_routes

router = APIRouter()
router.include_router(topic_routes)
