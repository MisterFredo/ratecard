import json
import logging
import re
from typing import List, Dict

from utils.llm import run_llm

logger = logging.getLogger(__name__)


# ============================================================
# CORE TRANSLATION (TEXT)
# ============================================================

def translate_text(text: str, target_lang: str) -> str:

    if not text or target_lang == "fr":
        return text

    prompt = f"""
You are a professional translator specialized in marketing, AdTech, and business content.

MISSION:
Translate the following text into {target_lang}.

STRICT RULES:
- Do NOT summarize
- Do NOT add information
- Do NOT remove information
- Keep the exact meaning
- Keep tone neutral and professional
- Keep formatting when relevant
- Preserve numbers exactly
- Preserve company / product names exactly

TEXT:
{text}

OUTPUT:
Return ONLY the translated text.
"""

    raw = run_llm(prompt)

    if not raw:
        return text

    return raw.strip()


# ============================================================
# BULK TRANSLATION (FEED)
# ============================================================

def translate_feed_items(items: List[Dict], lang: str) -> List[Dict]:

    if lang == "fr":
        return items

    translated_items = []

    for item in items:

        try:
            translated_title = translate_text(
                item.get("TITLE", ""),
                lang
            )

            translated_excerpt = translate_text(
                item.get("EXCERPT", ""),
                lang
            )

        except Exception:
            logger.exception("Translation error")
            translated_title = item.get("TITLE", "")
            translated_excerpt = item.get("EXCERPT", "")

        translated_items.append({
            **item,
            "TITLE": translated_title,
            "EXCERPT": translated_excerpt,
        })

    return translated_items


# ============================================================
# ADVANCED (OPTIONAL JSON MODE - FUTURE)
# ============================================================

def translate_feed_items_batch(items: List[Dict], lang: str) -> List[Dict]:
    """
    Version optimisée (1 appel LLM pour plusieurs items)
    À utiliser plus tard si besoin de perf / coût
    """

    if lang == "fr" or not items:
        return items

    payload = [
        {
            "id": item.get("id"),
            "title": item.get("TITLE"),
            "excerpt": item.get("EXCERPT"),
        }
        for item in items
    ]

    prompt = f"""
You are a professional translator.

Translate all items into {lang}.

STRICT RULES:
- Do NOT summarize
- Keep meaning EXACT
- Keep formatting
- Keep IDs unchanged
- Do NOT invent content

INPUT:
{json.dumps(payload, ensure_ascii=False)}

OUTPUT:
Return STRICT JSON:
[
  {{
    "id": "...",
    "title": "...",
    "excerpt": "..."
  }}
]
"""

    raw = run_llm(prompt)

    if not raw:
        return items

    try:
        match = re.search(r"\[[\s\S]*\]", raw)
        if not match:
            raise ValueError("JSON not found")

        translated = json.loads(match.group(0))

        mapped = {item["id"]: item for item in items}

        result = []

        for t in translated:
            original = mapped.get(t["id"])

            if not original:
                continue

            result.append({
                **original,
                "TITLE": t.get("title") or original.get("TITLE"),
                "EXCERPT": t.get("excerpt") or original.get("EXCERPT"),
            })

        return result

    except Exception:
        logger.exception("Batch translation parsing error")
        return items
