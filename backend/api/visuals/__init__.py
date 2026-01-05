from fastapi import APIRouter

from api.visuals.company import router as company_router
from api.visuals.person import router as person_router
from api.visuals.topic import router as topic_router
from api.visuals.event import router as event_router
from api.visuals.content import router as content_router

router = APIRouter()

router.include_router(company_router, prefix="/company")
router.include_router(person_router, prefix="/person")
router.include_router(topic_router, prefix="/topic")
router.include_router(event_router, prefix="/event")
router.include_router(content_router, prefix="/content")
