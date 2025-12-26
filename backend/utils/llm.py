# backend/utils/llm.py
import os
from openai import OpenAI

DEFAULT_LLM_MODEL = "gpt-4o"  # ton modèle par défaut

# ---------------------------------------------------------
# CRÉATION SÉCURISÉE DU CLIENT OPENAI
# ---------------------------------------------------------
def get_llm(model: str = None, temperature: float = 0.2):
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY manquant dans les variables Render")

    client = OpenAI(api_key=api_key)

    return {
        "client": client,
        "model": model or DEFAULT_LLM_MODEL,
        "temperature": temperature
    }


# ---------------------------------------------------------
# RUN LLM — VERSION ROBUSTE (compatible API moderne)
# ---------------------------------------------------------
def run_llm(prompt: str, model: str = None, temperature: float = 0.2) -> str:
    cfg = get_llm(model=model, temperature=temperature)

    try:
        completion = cfg["client"].chat.completions.create(
            model=cfg["model"],
            messages=[
                {"role": "system", "content": "Tu es un assistant expert."},
                {"role": "user", "content": prompt},
            ],
            temperature=cfg["temperature"]
        )

        return completion.choices[0].message["content"]

    except Exception as e:
        # On renvoie un texte safe (évite les 500 backend)
        return f"{{\"error\": \"llm_exception\", \"message\": \"{str(e)}\"}}"

