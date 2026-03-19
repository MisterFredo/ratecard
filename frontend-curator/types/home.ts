export type FeedBadge = {
  label: string;
  type: "SELECTION" | "SOCIETE" | "SOLUTION";
};

export type FeedItem = {
  id: string;
  type: "analysis" | "news";

  title: string;
  excerpt?: string;

  // 🔥 ajout clé
  signal?: string;
  concept?: string;

  // meta
  published_at?: string;

  // spécifique news
  company?: string;
};
