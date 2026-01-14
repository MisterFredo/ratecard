# backend/core/linkedin/generate_post.py

from typing import List, Dict
from utils.llm import run_llm


def generate_linkedin_post(sources: List[Dict]) -> str:
    """
    Génère un texte LinkedIn analytique à partir de sources News / Analyses.
    Retourne toujours une string (vide si échec).
    """

    if not sources:
        return ""

    # -----------------------------------------------------
    # Construction des sources textuelles
    # -----------------------------------------------------
    source_lines = []

    for i, s in enumerate(sources, start=1):
        title = s.get("title", "").strip()
        excerpt = (s.get("excerpt") or "").strip()
        stype = s.get("type", "").upper()

        if not title:
            continue

        block = f"{i}. [{stype}] Titre : {title}"
        if excerpt:
            block += f"\n   Extrait : {excerpt}"

        source_lines.append(block)

    if not source_lines:
        return ""

    sources_text = "\n\n".join(source_lines)

    # -----------------------------------------------------
    # Prompt strict (aucune extrapolation autorisée)
    # -----------------------------------------------------
    prompt = f"""
Tu dois rédiger un post LinkedIn en français à partir EXCLUSIVEMENT des éléments ci-dessous.

Règles absolues :
- N’ajoute aucun fait, chiffre, acteur ou information qui n’apparaît pas explicitement.
- Ne fais aucune extrapolation, aucune hypothèse.
- Ne donne aucune opinion personnelle.
- Ne fais pas de conclusion marketing.
- N’utilise jamais le pronom « nous ».

Objectif :
- Mettre en lumière les points communs, tendances ou signaux qui se dégagent.
- Produire un texte clair, analytique et factuel pour un public B2B.

Contraintes de forme :
- Longueur cible : 600 à 900 caractères.
- 1 courte introduction.
- 2 à 3 paragraphes maximum.
- Pas de liste à puces.

Sources :
{sources_text}
"""

    return run_llm(prompt)
