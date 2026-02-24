export type NewsletterNewsItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  news_type?: string;
  news_kind?: string;

  visual_rect_id?: string | null;
  company_visual_rect_id?: string | null;

  company?: {
    id_company: string;
    name: string;
    is_partner: boolean;
  };

  topics?: any[];
};

export type HeaderConfig = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mode: "ratecard" | "client";

  // 🔥 NOUVEAU
  showTopicStats?: boolean;
};

export type NewsletterAnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
};
