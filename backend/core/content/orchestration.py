# ============================================================
# SUMMARY + ANALYSE GENERATION — VERSION ENRICHIE
# ============================================================
def generate_summary(
    source_id: Optional[str],
    source_text: str,
    context: Optional[Dict[str, List[str]]] = None,
) -> Dict:

    """
    Génère :
    - title
    - excerpt
    - content_body
    - citations
    - chiffres
    - acteurs_cites
    - concepts
    - solutions

    + ANALYSE :
    - mecanique_expliquee
    - enjeu_strategique
    - point_de_friction
    - signal_analytique
    """

    if not source_text or not source_text.strip():
        raise ValueError("Source vide")

    context = context or {}

    content = transform_source_to_content(
        source_type=source_id,
        source_text=source_text,
        context=context,
    )

    if not isinstance(content, dict):
        raise ValueError("Réponse LLM invalide")

    return {
        # 🔹 ÉDITORIAL
        "title": content.get("title", ""),
        "excerpt": content.get("excerpt", ""),
        "content_body": content.get("content_body", ""),
        "citations": content.get("citations", []),
        "chiffres": content.get("chiffres", []),
        "acteurs_cites": content.get("acteurs_cites", []),

        # 🔹 TAGGING
        "concepts": content.get("concepts", []),
        "solutions": content.get("solutions", []),

        # 🔥 NOUVELLE COUCHE ANALYTIQUE
        "mecanique_expliquee": content.get("mecanique_expliquee", ""),
        "enjeu_strategique": content.get("enjeu_strategique", ""),
        "point_de_friction": content.get("point_de_friction", ""),
        "signal_analytique": content.get("signal_analytique", ""),
    }
