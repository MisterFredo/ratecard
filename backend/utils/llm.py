import os
import json
from openai import OpenAI

DEFAULT_LLM_MODEL = "gpt-4o"


# ---------------------------------------------------------
# CRÉATION SÉCURISÉE DU CLIENT OPENAI
# ---------------------------------------------------------
def get_llm(model: str = None, temperature: float = 0.2):
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        # ⚠️ NE JAMAIS LEVER UNE EXCEPTION ICI
        return {
            "error": "missing_api_key",
            "message": "OPENAI_API_KEY manquant dans les variables d’environnement"
        }

    try:
        client = OpenAI(api_key=api_key)
    except Exception as e:
        return {
            "error": "openai_client_error",
            "message": str(e)
        }

    return {
        "client": client,
        "model": model or DEFAULT_LLM_MODEL,
        "temperature": temperature
    }


# ---------------------------------------------------------
# RUN LLM — VERSION ULTRA ROBUSTE
# ---------------------------------------------------------
def run_llm(prompt: str, model: str = None, temperature: float = 0.2) -> str:
    cfg = get_llm(model=model, temperature=temperature)

    # ⚠️ Cas erreur infra / config → toujours une STRING JSON
    if isinstance(cfg, dict) and cfg.get("error"):
        return json.dumps({
            "error": cfg["error"],
            "message": cfg["message"]
        })

    try:
        completion = cfg["client"].chat.completions.create(
            model=cfg["model"],
            messages=[
                {"role": "system", "content": "Tu es un assistant éditorial expert B2B."},
                {"role": "user", "content": prompt},
            ],
            temperature=cfg["temperature"]
        )

        content = completion.choices[0].message.get("content")

        if not isinstance(content, str):
            return json.dumps({
                "error": "invalid_llm_response",
                "message": "La réponse du modèle n’est pas une chaîne de caractères"
            })

        return content

    except Exception as e:
        # ⚠️ JAMAIS d’exception remontée
        return json.dumps({
            "error": "llm_exception",
            "message": str(e)
        })
