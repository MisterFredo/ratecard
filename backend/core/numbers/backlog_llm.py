import json
import re
from typing import Dict, Any

from utils.llm import run_llm
from core.numbers.backlog_prompt import build_prompt


def safe_parse_json(text: str):

    try:
        return json.loads(text)
    except:

        # 🔥 extraction JSON si GPT ajoute du texte
        match = re.search(r"\{.*\}", text, re.DOTALL)

        if match:
            try:
                return json.loads(match.group())
            except:
                pass

    return None


def process_backlog_row(row: Dict[str, Any]) -> Dict[str, Any]:

    prompt = build_prompt(row)

    try:

        response = run_llm(
            prompt=prompt,
            temperature=0
        )

        # 🔥 DEBUG (tu peux commenter après)
        print("RAW LLM:", response)

        parsed = safe_parse_json(response)

        if not parsed:
            raise ValueError("Invalid JSON from LLM")

        return {
            "status": "ok",
            "input": row,
            "output": parsed,
        }

    except Exception as e:

        return {
            "status": "error",
            "input": row,
            "error": str(e),
        }
