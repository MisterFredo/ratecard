# backend/utils/llm.py

from openai import OpenAI
import os

DEFAULT_LLM_MODEL = "gpt-4o-mini"

def get_llm(model: str = None, temperature: float = 0.2):
    """
    Retourne un client LLM standardisé pour Ratecard.
    Utilise gpt-4o-mini par défaut pour réduire les coûts.
    """
    client = OpenAI()
    return {
        "client": client,
        "model": model or DEFAULT_LLM_MODEL,
        "temperature": temperature
    }

def run_llm(prompt: str, model: str = None, temperature: float = 0.2):
    cfg = get_llm(model=model, temperature=temperature)
    completion = cfg["client"].chat.completions.create(
        model=cfg["model"],
        messages=[{"role": "user", "content": prompt}],
        temperature=cfg["temperature"]
    )
    return completion.choices[0].message["content"]
