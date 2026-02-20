export type NewsletterNewsItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  news_kind: "NEWS" | "BRIEF";
  visual_rect_id?: string;
};

export type NewsletterAnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
};
