"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type NewsItemRaw = {
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;
  VISUAL_RECT_URL: string | null;
  PUBLISHED_AT?: string | null;

  ID_COMPANY: string;
  COMPANY_NAME: string;
  MEDIA_LOGO_RECTANGLE_ID?: string | null;
  IS_PARTNER?: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_url: string | null;
  published_at: string;

  company: {
    id_company: string;
    name: string;
    logo_rect_id?: string | null;
    is_partner: boolean;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   FETCH
========================================================= */

async function fetchNews(): Promise<NewsItemRaw[]> {
  const res = await fetch(
    `${API_BASE}/news/list`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.news || [];
}

/* =========================================================
   PAGE
========================================================= */

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { openRightDrawer } = useDrawer();
  const searchParams = useSearchParams();

  // 🔒 garde-fou anti-réouverture
  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     Chargement + mapping explicite des news
  --------------------------------------------------------- */
  useEffect(() => {
    fetchNews().then((rows) => {
      const mapped = rows.map((n) => ({
        id: n.ID_NEWS,
        title: n.TITLE,
        excerpt: n.EXCERPT ?? null,
        visual_rect_url: n.VISUAL_RECT_URL,
        published_at: n.PUBLISHED_AT || "",

        company: {
          id_company: n.ID_COMPANY,
          name: n.COMPANY_NAME,
          logo_rect_id: n.MEDIA_LOGO_RECTANGLE_ID ?? null,
          is_partner: n.IS_PARTNER === true,
        },
      }));

      setNews(mapped);
    });
  }, []);

  /* ---------------------------------------------------------
     Ouverture du drawer pilotée par l’URL
     /news?news_id=XXXX → mode = route
  --------------------------------------------------------- */
  useEffect(() => {
    const newsId = searchParams.get("news_id");

    if (!newsId) {
      lastOpenedId.current = null;
      return;
    }

    if (lastOpenedId.current === newsId) {
      return;
    }

    lastOpenedId.current = newsId;
    openRightDrawer("news", newsId, "route");

  }, [searchParams, openRightDrawer]);

  return (
    <div className="space-y-12 md:space-y-14">
      {/* =====================================================
          LISTE DES NEWS — PAGE DÉDIÉE
      ===================================================== */}
      {news.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune news publiée pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n) => (
            <PartnerSignalCard
              key={n.id}
              id={n.id}
              title={n.title}
              excerpt={n.excerpt}
              visualRectUrl={n.visual_rect_url}
              publishedAt={n.published_at}
              openInDrawer

              /* 🔑 CONTEXTE PARTENAIRE — IDENTIQUE À LA HOME */
              companyName={n.company.name}
              isPartner={n.company.is_partner}
            />
          ))}
        </div>
      )}
    </div>
  );
}


