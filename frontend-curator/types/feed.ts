// frontend-curator/types/home.ts

export type FeedBadge = {
  label: string;
  type: "TOPIC" | "COMPANY" | "SOLUTION";
};

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

  // 🔥 NOUVEAU → badges unifiés
  badges?: {
    label: string;
    type: "news_type" | "company" | "solution" | "topic";
  }[];
};
