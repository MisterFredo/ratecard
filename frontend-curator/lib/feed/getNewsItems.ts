export async function getNewsItems(params: Params): Promise<Response> {
  try {
    const query = new URLSearchParams();

    if (params.query) query.append("query", params.query);
    if (params.limit !== undefined) query.append("limit", String(params.limit));
    if (params.offset !== undefined) query.append("offset", String(params.offset));

    cleanArray(params.topic_ids).forEach((t) => query.append("topic_ids", t));
    cleanArray(params.company_ids).forEach((c) => query.append("company_ids", c));
    cleanArray(params.solution_ids).forEach((s) => query.append("solution_ids", s));
    cleanArray(params.news_types).forEach((nt) => query.append("news_types", nt));

    const res = await api.get(`/curator/news?${query.toString()}`);

    const items: FeedItem[] = (res?.items || []).map((item: any) => ({
      id: item.id,
      type: "news",

      title: item.title,
      excerpt: item.excerpt || null,
      published_at: item.published_at || null,

      company: item.company || null,

      has_visual: item.has_visual || false,
      media_id: item.media_id || null,

      news_type: item.news_type || null,
    }));

    return {
      items,
      count: res?.count ?? items.length,
    };

  } catch (e) {
    console.error("❌ getNewsItems error", e);
    return { items: [], count: 0 };
  }
}
