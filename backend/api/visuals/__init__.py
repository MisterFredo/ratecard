from fastapi import APIRouter

from api.visuals.company import router as company_router
from api.visuals.person import router as person_router
from api.visuals.axe import router as axe_router
from api.visuals.article import router as article_router

router = APIRouter()

router.include_router(company_router, prefix="/company", tags=["VISUALS"])
router.include_router(person_router, prefix="/person", tags=["VISUALS"])
router.include_router(axe_router, prefix="/axe", tags=["VISUALS"])
router.include_router(article_router, prefix="/article", tags=["VISUALS"])
