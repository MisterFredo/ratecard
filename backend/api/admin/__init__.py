from fastapi import APIRouter
from api.admin.routes import router as admin_routes

router = APIRouter()
router.include_router(admin_routes)
