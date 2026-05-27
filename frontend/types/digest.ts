// frontend/types/digest.ts

/* =========================================================
   CONTENT
========================================================= */

export type DigestContentItem = {
  id: string;

  /* ===============================
     CONTENT TYPE
  =============================== */

  content_type:
    | "news"
    | "analysis";

  /* ===============================
     CONTENT
  =============================== */

  title: string;

  excerpt?: string;

  published_at?: string;

  url?: string;

  /* ===============================
     VISUALS
  =============================== */

  media_id?: string | null;

  primary_company_logo?: string | null;

  /* ===============================
     ENTITIES
  =============================== */

  companies?: {
    id_company: string;

    name: string;

    is_partner?: boolean;
  }[];

  topics?: {
    id_topic?: string;

    label?: string;

    LABEL?: string;
  }[];

  /* ===============================
     BADGES
  =============================== */

  styles?: string[];
};

/* =========================================================
   NUMBERS
========================================================= */

export type DigestNumberItem = {
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
    type:
      | "company"
      | "topic"
      | "solution";

    id: string;

    label: string;
  };
};

/* =========================================================
   EDITORIAL FLOW
========================================================= */

export type DigestEditorialItem = {
  id: string;

  type:
    | "content"
    | "number";
};
