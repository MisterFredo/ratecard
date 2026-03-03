import re
from typing import Dict, Any, List
from utils.llm import run_llm


# ============================================================
# IA CONTENT — SOURCE → CONTENT (VERSION STRUCTURÉE STRATÉGIQUE)
# ============================================================
def transform_source_to_content(
    source_type: str,
    source_text: str,
    angle_title: str,
    angle_signal: str,
    context: Dict[str, Any],
    selected_concepts: List[Dict[str, str]],
) -> Dict[str, Any]:

    if not isinstance(source_text, str) or not source_text.strip():
        return {}

    # ---------------------------------------------------------
    # BUILD CONCEPT BLOCK
    # ---------------------------------------------------------
    concepts_block = "\n".join([
        f"- {c['title']} : {c['description']}"
        for c in selected_concepts
    ]) if selected_concepts else "Aucun concept spécifique."

    prompt = f"""
Tu es un assistant d’analyse stratégique pour Curator.

Ta mission est d’aider un éditeur humain à formaliser
une THÈSE ANALYTIQUE exploitable dans un moteur aval.

⚠️ RÈGLES FONDAMENTALES :
- Tu travailles STRICTEMENT à partir de la source fournie.
- Tu n’inventes jamais de faits, chiffres ou citations.
- Si une information n’est pas présente dans la source, tu écris "Aucun".
- Tu écris en français, avec un ton analytique, structuré et B2B.
- Tu ne rédiges pas un article média.
- Tu formalises une position intellectuelle claire et comparable.

==================== ANGLE ====================
Titre : {angle_title}
Signal : {angle_signal}

==================== CADRE CONCEPTUEL ====================
L’analyse doit être cohérente avec les concepts suivants :

{concepts_block}

Tu ne dois pas redéfinir ces concepts.
Tu dois structurer l’analyse en cohérence avec eux.
Si un concept n’est pas réellement présent dans la source,
ne le forces pas artificiellement.

==================== SOURCE ====================
Type : {source_type}
Texte :
{source_text}

==================== OBJECTIF ANALYTIQUE ====================

Le développement doit explicitement :

1. Identifier la TENSION centrale présente dans la source.
2. Décrire le MÉCANISME à l’œuvre.
3. Expliquer la CONSÉQUENCE logique si cette dynamique se poursuit.

Tu ne dois pas extrapoler au-delà des éléments contenus dans la source.

==================== FORMAT DE SORTIE ATTENDU ====================

EXCERPT
(1 à 2 phrases synthétiques exprimant clairement la thèse.)

CONCEPT
(1 phrase unique, dense, qui formalise la tension centrale.)

DEVELOPPEMENT
(Texte structuré en 3 blocs logiques :
- Tension
- Mécanisme
- Conséquence)

CITATIONS
(Liste des citations EXACTES présentes dans la source,
entre guillemets. Si aucune, écris : Aucun.)

CHIFFRES
(Liste des chiffres présents dans la source. Si aucun, écris : Aucun.)

ACTEURS
(Liste des entreprises citées. Jamais de personnes physiques.
Si aucun, écris : Aucun.)
"""

    raw = run_llm(prompt)

    # ---------------------------------------------------------
    # PARSING
    # ---------------------------------------------------------
    sections = {
        "EXCERPT": "",
        "CONCEPT": "",
        "DEVELOPPEMENT": "",
        "CITATIONS": "",
        "CHIFFRES": "",
        "ACTEURS": "",
    }

    current = None
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue

        if line.upper() in sections:
            current = line.upper()
            continue

        if current:
            sections[current] += line + "\n"

    excerpt = sections["EXCERPT"].strip()
    concept = sections["CONCEPT"].strip()
    body = sections["DEVELOPPEMENT"].strip()

    def parse_list(block: str):
        if not block or block.lower().startswith("aucun"):
            return []
        items = []
        for line in block.splitlines():
            line = re.sub(r"^[-•]\s*", "", line.strip())
            if line:
                items.append(line)
        return items

    citations = parse_list(sections["CITATIONS"])
    chiffres = parse_list(sections["CHIFFRES"])
    acteurs = parse_list(sections["ACTEURS"])

    if not excerpt and not body:
        clean = source_text.strip()
        return {
            "excerpt": angle_signal,
            "concept": angle_signal,
            "content_body": clean[:800],
            "citations": [],
            "chiffres": [],
            "acteurs": [],
        }

    return {
        "excerpt": excerpt,
        "concept": concept,
        "content_body": body,
        "citations": citations,
        "chiffres": chiffres,
        "acteurs": acteurs,
    }
