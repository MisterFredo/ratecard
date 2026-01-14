from typing import List, Dict
from utils.llm import run_llm


def generate_linkedin_post(sources: List[Dict]) -> str:
    """
    Génère un post LinkedIn structuré et lisible au scroll
    à partir de sources News / Analyses.

    PRINCIPES :
    - STRICTEMENT basé sur les titres et excerpts fournis
    - Aucun fait ajouté
    - Aucun style journalistique
    - Sortie optimisée pour LinkedIn (scan / blocs)
    """

    if not sources:
        return ""

    # -----------------------------------------------------
    # Construction des sources verrouillées
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
    # PROMPT — LINKEDIN NATIVE (STRUCTURE OBLIGATOIRE)
    # -----------------------------------------------------
    prompt = f"""
Tu dois rédiger un post LinkedIn en français à partir EXCLUSIVEMENT des éléments ci-dessous.

RÈGLES ABSOLUES (NON NÉGOCIABLES) :
- N’ajoute aucun fait, chiffre, acteur ou information qui n’apparaît PAS explicitement.
- Ne fais AUCUNE extrapolation, AUCUNE hypothèse.
- Ne donne AUCUNE opinion.
- Ne fais AUCUNE conclusion marketing.
- N’utilise JAMAIS le pronom « nous ».
- N’utilise PAS de ton journalistique narratif.
- N’utilise PAS de termes vagues ou creux (ex : « dynamique », « illustre », « témoigne »).

OBJECTIF :
- Produire une lecture claire et structurée adaptée au scroll LinkedIn.
- Mettre en évidence un signal commun FACTUEL entre les sources.
- Aider à comprendre, pas à raconter une histoire.

STRUCTURE OBLIGATOIRE DU POST LINKEDIN :

1. Une première ligne servant de titre / accroche claire et factuelle.
2. Une phrase de contexte courte (1 à 2 lignes maximum).
3. Ensuite, un bloc par source, CHAQUE FOIS sous cette forme exacte :

👉 [Intitulé principal issu du titre]
Phrase factuelle basée UNIQUEMENT sur le titre et/ou l’extrait.

4. Une phrase de clôture factuelle qui reformule le signal commun, sans extrapolation.

CONTRAINTES DE FORME :
- Texte lisible en diagonale.
- Paragraphes courts.
- Retours à la ligne fréquents.
- Pas de listes à puces classiques.
- Pas d’emojis.
- Pas de hashtags.
- Longueur cible : 700 à 1 000 caractères.

SOURCES (SEUL CONTENU AUTORISÉ) :
{sources_text}
"""

    # -----------------------------------------------------
    # Appel LLM (texte brut uniquement)
    # -----------------------------------------------------
    return run_llm(prompt)
