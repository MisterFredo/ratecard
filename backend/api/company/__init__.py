from fastapi import APIRouter
from api.company.routes import router as company_routes

router = APIRouter(tags=["COMPANY"])
router.include_router(company_routes)
