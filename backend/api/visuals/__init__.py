from fastapi import APIRouter

from api.visuals.company import router as company_router
from api.visuals.person import router as person_router
from api.visuals.topic import router as topic_router
from api.visuals.article import router as article_router

router = APIRouter()

router.include_router(company_router, prefix="/company")
router.include_router(person_router, prefix="/person")
router.include_router(topic_router, prefix="/topic")
router.include_router(article_router, prefix="/article")
