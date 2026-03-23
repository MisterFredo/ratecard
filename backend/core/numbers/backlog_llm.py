import json
from typing import Dict, Any

from utils.llm import run_llm
from core.numbers.backlog_prompt import build_prompt


def process_backlog_row(row: Dict[str, Any]) -> Dict[str, Any]:

    prompt = build_prompt(row)

    try:

        response = run_llm(
            prompt=prompt,
            temperature=0
        )

        # 🔥 parse JSON propre
        data = json.loads(response)

        return {
            "status": "ok",
            "input": row,
            "output": data,
        }

    except Exception as e:

        return {
            "status": "error",
            "input": row,
            "error": str(e),
        }
