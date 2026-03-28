from typing import Dict, List


def build_suggestions(
    intent: str,
    entity: Dict,
    items: List[Dict] = None
) -> List[str]:

    label = entity.get("label")

    # -------------------------------
    # FEED
    # -------------------------------
    if intent == "feed":
        return [
            f"Analyse les tendances {label}" if label else "Analyse les tendances CTV",
            f"Donne-moi les chiffres {label}" if label else "Donne-moi les chiffres du marché",
            "Que fait Amazon en ce moment ?"
        ]

    # -------------------------------
    # ANALYSIS
    # -------------------------------
    if intent == "analysis":
        return [
            f"Donne-moi les chiffres {label}" if label else "Donne-moi les chiffres du marché",
            f"Que fait {label} en ce moment ?" if label else "Que fait Criteo en ce moment ?",
            "Quoi de neuf dans le retail media ?"
        ]

    # -------------------------------
    # NUMBERS
    # -------------------------------
    if intent == "numbers":
        return [
            f"Analyse les tendances {label}" if label else "Analyse les tendances CTV",
            f"Que fait {label} en ce moment ?" if label else "Que fait Amazon en ce moment ?",
            "Quoi de neuf dans le retail media ?"
        ]

    # -------------------------------
    # COMPANY
    # -------------------------------
    if intent == "company":
        return [
            f"Donne-moi les chiffres {label}",
            f"Analyse les tendances liées à {label}",
            "Quoi de neuf dans le retail media ?"
        ]

    # -------------------------------
    # TOPIC
    # -------------------------------
    if intent == "topic":
        return [
            f"Donne-moi les chiffres {label}",
            f"Que fait Amazon sur {label} ?",
            "Quoi de neuf dans le retail media ?"
        ]

    # -------------------------------
    # UNDERSTAND (RADAR)
    # -------------------------------
    if intent == "understand":
        return [
            f"Donne-moi les chiffres {label}",
            f"Que fait Amazon sur {label} ?",
            "Analyse les tendances CTV"
        ]

    # -------------------------------
    # SEARCH (fallback)
    # -------------------------------
    if intent == "search":

        # 👉 essayer d’extraire companies depuis items
        companies = []

        if items:
            for i in items:
                for c in i.get("companies", []):
                    if c.get("name") not in companies:
                        companies.append(c.get("name"))

        suggestions = []

        if companies:
            suggestions.append(f"Que fait {companies[0]} en ce moment ?")

        suggestions += [
            f"Analyse {label}" if label else "Analyse les tendances CTV",
            "Donne-moi les chiffres du marché"
        ]

        return suggestions[:3]

    # -------------------------------
    # DEFAULT
    # -------------------------------
    return [
        "Quoi de neuf dans le retail media ?",
        "Analyse les tendances CTV",
        "Donne-moi les chiffres du marché"
    ]
