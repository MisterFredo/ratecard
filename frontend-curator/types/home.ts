export type FeedBadge = {
  label: string;
  type: "SELECTION" | "SOCIETE" | "SOLUTION";
};


export type FeedItem = {
  id: string;
  type: "analysis" | "source"; // 🔥 clé

  title: string;
  excerpt?: string;
  date?: string;

  badges?: FeedBadge[];
};
