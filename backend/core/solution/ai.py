# backend/core/solution/ai.py

from typing import List
from utils.llm import run_llm


# ============================================================
# SUGGEST SOLUTION ALIASES
# ============================================================

def suggest_solution_aliases(name: str) -> List[str]:

    if not name or not name.strip():
        return []

    prompt = f"""
Tu es un expert en data marketing et normalisation d'entités.

OBJECTIF :
Générer une liste d'alias fiables pour une SOLUTION (produit, plateforme, marque).

SOLUTION :
{name}

RÈGLES STRICTES :
- Ne donner QUE des variantes du produit / de la solution
- Inclure :
  - nom exact
  - variantes d’écriture (espaces, casse, ponctuation)
  - acronymes si utilisés pour désigner CETTE solution

- EXCLURE STRICTEMENT :
  - nom de la société (ex : OpenAI, Google, Meta)
  - autres produits ou marques
  - termes génériques (ex : platform, solution, tool)

- Ne jamais inventer
- Ne jamais ajouter de description
- Ne jamais expliquer
- Réponse sous forme de liste simple (1 ligne = 1 alias)
- Maximum 10 éléments

FORMAT :
ChatGPT
Chat GPT
GPT Chat
"""

    raw = run_llm(prompt)

    if not raw:
        return []

    aliases = []

    for line in raw.splitlines():
        clean = line.strip()
        if clean:
            aliases.append(clean)

    # 🔥 Déduplication simple
    return list(set(aliases))
