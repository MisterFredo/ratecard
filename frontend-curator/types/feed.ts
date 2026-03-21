/* =========================================================
   BADGES (UI LAYER)
========================================================= */

export type FeedBadgeType =
  | "topic"
  | "company"
  | "solution"
  | "news_type";

export type FeedBadge = {
  id?: string;
  label: string;
  type: FeedBadgeType;
};


/* =========================================================
   ENTITIES (ALIGNÉ BACKEND + EXTENSIBLE)
========================================================= */

export type Topic = {
  id_topic: string;
  label: string;

  // structure
  axis?: string;

  // stats
  nb_analyses?: number;
  delta_30d?: number;
};

export type Company = {
  id_company: string;
  name: string;

  // branding
  media_logo_rectangle_id?: string | null;

  // statut
  is_partner?: boolean;

  // stats
  nb_analyses?: number;
  delta_30d?: number;
};

export type Solution = {
  id_solution: string;
  name: string;

  // relation
  id_company?: string;
  company_name?: string;

  // branding (hérité société)
  media_logo_rectangle_id?: string | null;

  // statut
  is_partner?: boolean;

  // stats
  nb_analyses?: number;
  delta_30d?: number;
};


/* =========================================================
   ITEM (ALIGNÉ SEARCH BACKEND)
========================================================= */

export type FeedItem = {
  id: string;

  // 🔥 aligné backend
  type: "news" | "analysis";

  title: string;
  excerpt?: string | null;
  published_at?: string | null;

  // 🔥 entités structurées
  topics?: Topic[];
  companies?: Company[];
  solutions?: Solution[];

  // 🔥 spécifique news
  news_type?: string | null;

  // 🔻 FUTUR (non bloquant)
  has_visual?: boolean;
  media_id?: string | null;

  // 🔻 couche UI optionnelle
  badges?: FeedBadge[];
};


/* =========================================================
   META (FUTUR — FILTRES / FACETS)
========================================================= */

export type MetaItem = {
  id: string;
  label: string;
  count: number;
};

export type FeedMetaResponse = {
  topics: MetaItem[];
  companies: MetaItem[];
  solutions: MetaItem[];
  news_types: MetaItem[];
};


/* =========================================================
   RESPONSE
========================================================= */

export type FeedResponse = {
  items: FeedItem[];
  count: number;
};
