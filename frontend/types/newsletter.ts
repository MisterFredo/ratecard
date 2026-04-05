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
     VARIANT
  =============================== */
  variant?: "media" | "consulting";

  /* ===============================
     TOP BAR
  =============================== */
  topBarEnabled?: boolean;
  topBarColor?: string;

  /* ===============================
     COLORS
  =============================== */
  periodColor?: string;

  /* ===============================
     EDITORIAL
  =============================== */
  introHtml?: string;

  /* ===============================
     EVENT (🔥 CORE)
  =============================== */
  eventId?: string;

  /* ===============================
     HERO CONTROL (🔥 NEW)
  =============================== */
  showHero?: boolean;

  /* ===============================
     MEDIA (FALLBACK)
  =============================== */

  // lien cliquable sur le hero
  heroLink?: string;

  // override image hero
  heroImageUrl?: string;

  /* ===============================
     LOGO CONTROL (🔥 NEW)
  =============================== */
  showLogo?: boolean;

  // lien du logo
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

  /* 🔥 CRITIQUE */
  url?: string;

  /* ===============================
     BADGES (ALIGN WITH NEWS)
  =============================== */

  topics?: {
    id_topic?: string;
    label?: string;
    LABEL?: string;
  }[];

  companies?: {
    id_company: string;
    name: string;
  }[];

  company?: {
    id_company: string;
    name: string;
  };

  styles?: string[];
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
