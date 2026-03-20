// frontend-curator/types/feed.ts

/* =========================================================
   BADGES (gardé pour futur)
========================================================= */

export type FeedBadgeType =
  | "topic"
  | "company"
  | "solution"
  | "news_type";

export type FeedBadge = {
  id?: string;
  label: string;
  type: FeedBadgeType;
};


/* =========================================================
   COMPANY (gardé pour futur enrichissement)
========================================================= */

export type FeedCompany = {
  id: string;
  name: string;
};


/* =========================================================
   ITEM (ALIGNÉ SEARCH BACKEND)
========================================================= */

export type FeedItem = {
  id: string;

  // 🔥 IMPORTANT → aligné avec backend
  type: "news" | "analysis";

  title: string;
  excerpt?: string | null;
  published_at?: string | null;

  // 🔻 FUTUR (optionnel, non utilisé pour l’instant)
  company?: FeedCompany | null;
  has_visual?: boolean;
  media_id?: string | null;
  news_type?: string | null;
  badges?: FeedBadge[];
};

export type MetaItem = {
  id: string;
  label: string;
  count: number;
};

export type FeedMetaResponse = {
  topics: MetaItem[];
  companies: MetaItem[];
  solutions: MetaItem[];
  news_types: MetaItem[];
};


/* =========================================================
   RESPONSE
========================================================= */

export type FeedResponse = {
  items: FeedItem[];
  count: number;
};
