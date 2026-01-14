from typing import List, Dict
from utils.llm import run_llm


def generate_linkedin_post(sources: List[Dict]) -> str:
    """
    Génère un post LinkedIn analytique et structuré
    à partir de sources News / Analyses.

    - STRICTEMENT basé sur les titres et excerpts fournis
    - Aucune extrapolation
    - Aucune création de faits
    - Texte brut uniquement
    """

    if not sources:
        return ""

    # -----------------------------------------------------
    # Construction des blocs sources (verrouillés)
    # -----------------------------------------------------
    source_blocks = []

    for idx, s in enumerate(sources, start=1):
        source_type = (s.get("type") or "").upper()
        title = (s.get("title") or "").strip()
        excerpt = (s.get("excerpt") or "").strip()

        if not title:
            continue

        block = f"{idx}. [{source_type}]\nTitre : {title}"
        if excerpt:
            block += f"\nExtrait : {excerpt}"

        source_blocks.append(block)

    if not source_blocks:
        return ""

    sources_text = "\n\n".join(source_blocks)

    # -----------------------------------------------------
    # PROMPT ÉDITORIAL STRICT — LINKEDIN RATECARD
    # -----------------------------------------------------
    prompt = f"""
Tu dois rédiger un post LinkedIn en français à partir EXCLUSIVEMENT des éléments listés ci-dessous.

RÈGLES ABSOLUES (NON NÉGOCIABLES) :
- N’ajoute aucun fait, chiffre, acteur ou information qui n’apparaît PAS explicitement.
- Ne fais AUCUNE extrapolation, AUCUNE hypothèse.
- Ne donne AUCUNE opinion.
- Ne fais AUCUNE conclusion marketing.
- N’utilise JAMAIS le pronom « nous ».
- N’emploie PAS de termes vagues ou creux (ex : « dynamique », « illustre », « témoigne ») sans fait précis associé.

OBJECTIF :
- Mettre en lumière le POINT COMMUN ou le SIGNAL partagé par les sources.
- Rester factuel, analytique et structurant pour un public B2B.
- Produire une lecture claire, pas un résumé journalistique.

STRUCTURE OBLIGATOIRE DU TEXTE :
1. Une phrase d’introduction qui décrit explicitement le point commun entre les sources.
2. Un paragraphe par source :
   - rappeler le fait principal tel qu’il apparaît dans le titre et/ou l’extrait
   - sans reformulation approximative
3. Une phrase de conclusion qui reformule le signal commun, sans extrapolation.

CONTRAINTES DE FORME :
- Longueur cible : entre 600 et 900 caractères.
- Paragraphes courts.
- Pas de listes à puces.
- Pas d’emojis.
- Pas de hashtags.

SOURCES (SEUL CONTENU AUTORISÉ) :
{sources_text}
"""

    # -----------------------------------------------------
    # Appel LLM (texte brut uniquement)
    # -----------------------------------------------------
    return run_llm(prompt)
