from fastapi import APIRouter
from api.person.routes import router as person_routes

router = APIRouter(tags=["PERSON"])
router.include_router(person_routes)
