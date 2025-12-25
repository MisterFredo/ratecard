from openai import OpenAI

def get_llm(model: str = None, temperature: float = 0.2):
    client = OpenAI()                      # <-- utilisation de la clé API
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
