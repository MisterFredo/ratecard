from fastapi import APIRouter
from api.content_read.routes import router as content_read_routes

router = APIRouter()
router.include_router(content_read_routes)
