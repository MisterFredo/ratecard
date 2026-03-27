# core/mcp/response_builder.py

from openai import OpenAI

client = OpenAI()

def build_market_analysis_response(rows):

    # 🔹 construire un bloc texte
    contents = []

    for r in rows:
        contents.append(f"- {r['title']} : {r['excerpt']}")

    content_block = "\n".join(contents[:20])

    prompt = f"""
Tu es un analyste expert.

À partir des analyses suivantes :

{content_block}

Produis :

1. Une synthèse (3 lignes)
2. 3 tendances clés
3. Les acteurs principaux
4. Une lecture stratégique

Réponse structurée et concise.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return {
        "text": response.choices[0].message.content,
        "nb_contents": len(rows)
    }
