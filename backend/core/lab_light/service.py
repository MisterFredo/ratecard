# backend/core/lab_light/service.py

from utils.llm import run_llm

def transform_source(source_type: str, source_text: str, author: str) -> dict:
    """
    Transforme une source brute en ARTICLE_DRAFT Ratecard.
    """
    prompt = f"""
Tu es un assistant éditorial professionnel chargé de transformer une SOURCE BRUTE 
en un ARTICLE DRAFT pour le média Ratecard.fr.

CONTRAINTES :
- Ne pas inventer de faits.
- Ne jamais reformuler les citations directes des clients (source_type = PRESS_RELEASE, BLOG, PRODUCT).
- Respecter le sens exact des propos (source_type = INTERVIEW).
- Style Ratecard : professionnel, clair, concis, orienté marché.
- Ajouter un angle éditorial concis si pertinent.
- Structurer en HTML propre : <p>, <h2>, <ul>.
- Ne jamais utiliser un style LinkedIn ni de langage promotionnel excessif.

TYPES DE SOURCE :
- LINKEDIN_POST → transformation éditoriale plus forte + contextualisation.
- PRESS_RELEASE / BLOG / PRODUCT → respect strict du wording client.
- INTERVIEW → reformulation douce, Q/A propres.
- MEETING_NOTE / EVENT_RECAP → synthèse + structure en sections.

ATTENDU :
Retourne UNIQUEMENT un JSON valide :

{{
  "title_proposal": "",
  "excerpt": "",
  "content_html": "",
  "angle": "",
  "suggested_topics": [],
  "suggested_companies": [],
  "suggested_products": [],
  "notes": ""
}}

SOURCE_TYPE: {source_type}
AUTEUR: {author}
SOURCE_BRUTE :
{source_text}
"""

    raw = run_llm(prompt)

    # On renverra le JSON brut (le front fera validation/sanitation)
    import json
    try:
        result = json.loads(raw)
        return result
    except Exception:
        return {"error": "invalid_json", "raw": raw}
