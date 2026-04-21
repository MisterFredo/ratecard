from typing import List
from utils.llm import run_llm


def suggest_company_aliases(name: str) -> List[str]:

    if not name or not name.strip():
        return []

    prompt = f"""
Tu es un expert en data marketing et normalisation d'entités.

OBJECTIF :
Générer une liste d'alias fiables pour une ENTREPRISE uniquement.

ENTREPRISE :
{name}

RÈGLES STRICTES :
- Ne donner QUE des alias de la société elle-même
- Inclure :
  - nom officiel
  - variantes d’écriture
  - acronymes
- EXCLURE STRICTEMENT :
  - marques
  - produits
  - plateformes
  - solutions

- Ne jamais inventer
- Ne jamais ajouter de description
- Réponse sous forme de liste simple (1 ligne = 1 alias)
- Maximum 10 éléments

FORMAT :
Meta Platforms
Meta
META
"""

    raw = run_llm(prompt)

    if not raw:
        return []

    aliases = []

    for line in raw.splitlines():
        clean = line.strip()
        if clean:
            aliases.append(clean)

    return list(set(aliases))
