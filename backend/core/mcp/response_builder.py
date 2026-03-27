# core/mcp/response_builder.py

from openai import OpenAI

client = OpenAI()

def build_market_analysis_response(rows):

    # 🔹 construire bloc contenu
    contents = []

    for r in rows:
        title = r.get("title", "")
        excerpt = r.get("excerpt", "")
        contents.append(f"- {title}\n  {excerpt}")

    content_block = "\n".join(contents[:20])

    # 🔥 PROMPT DANS LA FONCTION (IMPORTANT)
    prompt = f"""
Tu es un analyste senior spécialisé en marketing digital et retail media.

Tu travailles uniquement à partir des analyses fournies. Tu n'inventes rien.

Voici les analyses :

{content_block}

MISSION :

Tu dois produire une analyse claire, structurée et actionnable.

CONTRAINTES STRICTES :

- Tu identifies EXACTEMENT 3 tendances (ni plus, ni moins)
- Chaque tendance doit être concrète et différente
- Interdit de faire des phrases vagues ou génériques
- Interdit de répéter les titres
- Interdit de paraphraser sans valeur

FORMAT DE SORTIE :

## Synthèse
(3 lignes maximum, vision globale du marché)

## Tendances clés

### 1. [Nom de la tendance]
Description précise (2-3 lignes)

### 2. [Nom de la tendance]
Description précise (2-3 lignes)

### 3. [Nom de la tendance]
Description précise (2-3 lignes)

## Acteurs clés
Liste des acteurs réellement mentionnés ou impliqués

## Lecture stratégique
(ce que ça change concrètement pour le marché)

STYLE :

- Direct
- Sans blabla
- Niveau analyste (cabinet de conseil)
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )

    return {
        "text": response.choices[0].message.content,
        "nb_contents": len(rows)
    }
