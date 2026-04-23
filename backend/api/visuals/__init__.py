from fastapi import APIRouter

from api.visuals.company import router as company_router
from api.visuals.solution import router as solution_router
from api.visuals.person import router as person_router
from api.visuals.topic import router as topic_router
from api.visuals.event import router as event_router
from api.visuals.news import router as news_router
from api.visuals.source import router as source_router

router = APIRouter()

router.include_router(company_router, prefix="/company")
router.include_router(solution_router, prefix="/solution")
router.include_router(person_router, prefix="/person")
router.include_router(topic_router, prefix="/topic")
router.include_router(event_router, prefix="/event")
router.include_router(news_router, prefix="/news")
router.include_router(source_router, prefix="/source")
