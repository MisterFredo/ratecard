export type FeedBadge = {
  label: string;
  type: "SELECTION" | "SOCIETE" | "SOLUTION";
};

export type FeedItem = {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  badges?: FeedBadge[];
};
