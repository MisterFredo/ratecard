// frontend-curator/types/feed.ts

/* =========================================================
   BADGES
========================================================= */

export type FeedBadgeType =
  | "topic"
  | "company"
  | "solution"
  | "news_type";

export type FeedBadge = {
  id?: string;              // 🔥 utile pour filtres / clic
  label: string;
  type: FeedBadgeType;
};


/* =========================================================
   COMPANY (STRUCTURÉ)
========================================================= */

export type FeedCompany = {
  id: string;
  name: string;
};


/* =========================================================
   ITEM
========================================================= */

export type FeedItem = {
  id: string;
  type: "news" | "analysis";

  title: string;
  excerpt?: string | null;
  published_at?: string | null;

  // 🔵 COMPANY (unifié news + content)
  company?: FeedCompany | null;

  // 🔵 news uniquement
  has_visual?: boolean;
  media_id?: string | null;
  news_type?: string | null;

  // 🔥 badges (source unique UI)
  badges?: FeedBadge[];
};


/* =========================================================
   RESPONSE (NOUVEAU)
========================================================= */

export type FeedResponse = {
  items: FeedItem[];
  count: number;
};


/* =========================================================
   META (FILTRES)
========================================================= */

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
