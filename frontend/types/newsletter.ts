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

  topics?: {
    id_topic?: string;
    label?: string;
    LABEL?: string;
  }[];
};

export type HeaderCompany = {
  id_company: string;
  name: string;
  media_logo_rectangle_id?: string | null;
};

export type TopicStat = {
  label: string;
  last_30_days: number;
  total: number;
};

export type HeaderConfig = {
  title: string;
  subtitle?: string;

  // Société sélectionnée pour le logo header
  headerCompany?: HeaderCompany;

  showTopicStats?: boolean;
};

export type NewsletterAnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
};
