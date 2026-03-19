// frontend-curator/types/home.ts

export type FeedBadge = {
  label: string;
  type: "TOPIC" | "COMPANY" | "SOLUTION";
};

export type FeedItem = {
  id: string;
  type: "analysis" | "news";

  title: string;
  excerpt?: string | null;

  // 🔥 meta
  published_at?: string | null;

  // 🔥 news spécifique
  company?: string | null;
  news_type?: string | null;

  // 🔥 visuel (clé UX)
  has_visual?: boolean;
  media_id?: string | null;

  // ⚠️ LEGACY (à supprimer plus tard)
  signal?: string;
  concept?: string;
};
