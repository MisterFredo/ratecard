# backend/api/health/routes.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health():
    return {
        "status": "ok",
        "message": "Ratecard backend running"
    }
