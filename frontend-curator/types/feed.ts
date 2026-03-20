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
  label: string;
  type: FeedBadgeType;
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

  // 🔵 news uniquement
  company?: string | null;
  has_visual?: boolean;
  media_id?: string | null;
  news_type?: string | null;

  // 🔥 badges unifiés
  badges?: FeedBadge[];
};
