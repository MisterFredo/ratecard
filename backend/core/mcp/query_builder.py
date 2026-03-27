def build_content_query(topic_label: str) -> str:

    return f"""
    SELECT *
    FROM `adex-5555.RATECARD_PROD.V_CONTENT_ENRICHED`
    WHERE EXISTS (
        SELECT 1 FROM UNNEST(topics)
        WHERE LOWER(label) = LOWER("{topic_label}")
    )
    ORDER BY published_at DESC
    LIMIT 20
    """
