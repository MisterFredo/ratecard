from fastapi import APIRouter
from api.mcp.routes import router as mcp_routes

router = APIRouter()
router.include_router(mcp_routes)
