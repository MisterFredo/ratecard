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

/* =========================================================
   HEADER
========================================================= */

export type HeaderCompany = {
  id_company: string;
  name: string;
  media_logo_rectangle_id?: string | null;
};

export type HeaderConfig = {
  title: string;
  subtitle?: string;
  period?: string;

  headerCompany?: HeaderCompany;

  showTopicStats?: boolean;

  /* ===============================
     NEW (HEADER V2)
  =============================== */
  variant?: "media" | "consulting";

  topBarEnabled?: boolean;
  topBarColor?: string;

  periodColor?: string;

  introHtml?: string;
  eventId?: string;

  /* ===============================
     NEW (MEDIA LOGIC)
  =============================== */

  // 🔗 lien cliquable sur le hero (image Le Touquet, etc.)
  heroLink?: string;

  // 🖼️ optionnel : override du visuel hero (sinon fallback LeTouquet)
  heroImageUrl?: string;

  // 🔗 rendre le logo cliquable (ex: homepage Ratecard)
  logoLink?: string;
};

/* =========================================================
   STATS
========================================================= */

export type TopicStat = {
  label: string;
  last_30_days: number;
  total: number;
};

/* =========================================================
   ANALYSES
========================================================= */

export type NewsletterAnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
};

/* =========================================================
   NUMBERS
========================================================= */

export type NewsletterNumberItem = {
  id: string;

  label: string;
  value?: number;
  unit?: string;
  scale?: string;

  type?: string;
  category?: string;

  zone?: string;
  period?: string;

  entity?: {
    type: "company" | "topic" | "solution";
    id: string;
    label: string;
  };
};
