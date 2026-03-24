from fastapi import APIRouter, HTTPException

from api.scan.models import ScanRequest
from core.scan.service import get_news_by_ids, format_scan_as_text

router = APIRouter()


@router.post("/news")
def scan_news(payload: ScanRequest):
    """
    Génère un SCAN (lecture rapide) à partir des news sélectionnées.
    Output = texte prêt à copier (email / slack / doc).
    """

    try:
        # 🔹 1. récupération des news
        items = get_news_by_ids(payload.ids)

        # 🔹 2. sécurité (vide)
        if not items:
            return {
                "text": "Aucune actualité sélectionnée."
            }

        # 🔹 3. formatage texte (core produit)
        text = format_scan_as_text(items)

        # 🔹 4. retour
        return {
            "text": text,
            "count": len(items)
        }

    except Exception as e:
        raise HTTPException(400, f"Erreur scan : {e}")
