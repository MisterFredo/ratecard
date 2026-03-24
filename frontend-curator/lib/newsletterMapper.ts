import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

import type { FeedItem } from "@/types/feed";

export function mapFeedToNewsletter(items: FeedItem[]) {

  const news: NewsletterNewsItem[] = [];
  const analyses: NewsletterAnalysisItem[] = [];

  for (const i of items) {

    const base = {
      title: i.title,
      excerpt: i.excerpt || "",
      date: i.published_at,
      companies: i.companies || [],
      topics: i.topics || [],
    };

    if (i.type === "news") {
      news.push(base as NewsletterNewsItem);
    }

    if (i.type === "analysis") {
      analyses.push({
        ...base,
        signal: "", // fallback pour builder
        mecanique: "",
        enjeu: "",
      } as NewsletterAnalysisItem);
    }
  }

  return { news, analyses };
}
