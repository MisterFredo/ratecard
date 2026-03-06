"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Mode = "public" | "workspace";

/* =========================================================
   TYPES
========================================================= */

type NewsItemRaw = {
  id_news: string;
  title: string;
  excerpt?: string | null;
  visual_rect_id?: string | null;
  published_at?: string | null;

  id_company: string;
  company_name: string;
  media_logo_rectangle_id?: string | null;
  is_partner?: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_id?: string | null;
  published_at: string;

  company: {
    id_company: string;
    name: string;
    logo_rect_id?: string | null;
    is_partner: boolean;
  };
};

/* =========================================================
   FETCH
========================================================= */

async function fetchNews(): Promise<NewsItemRaw[]> {
  const res = await fetch(`${API_BASE}/news/list?kind=NEWS`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = await res.json();
  return json.news || [];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function NewsScreen({ mode }: { mode: Mode }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { openRightDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     LOAD NEWS
  --------------------------------------------------------- */
  useEffect(() => {
    fetchNews().then((rows) => {
      const mapped: NewsItem[] = rows.map((n) => ({
        id: n.id_news,
        title: n.title,
        excerpt: n.excerpt ?? null,
        visual_rect_id: n.visual_rect_id ?? null,
        published_at: n.published_at || "",
        company: {
          id_company: n.id_company,
          name: n.company_name,
          logo_rect_id: n.media_logo_rectangle_id ?? null,
          is_partner: n.is_partner === true,
        },
      }));

      setNews(mapped);
    });
  }, []);

  /* ---------------------------------------------------------
     DRAWER — PILOTÉ PAR URL
     /news?news_id=XXX
  --------------------------------------------------------- */
  useEffect(() => {
    const newsId = searchParams.get("news_id");

    if (!newsId) {
      lastOpenedId.current = null;
      return;
    }

    if (lastOpenedId.current === newsId) return;

    lastOpenedId.current = newsId;

    openRightDrawer("news", newsId, "route");
  }, [searchParams, openRightDrawer]);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="space-y-12 md:space-y-14">
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
              visualRectId={n.visual_rect_id}
              companyVisualRectId={n.company.logo_rect_id}
              companyName={n.company.name}
              isPartner={n.company.is_partner}
              publishedAt={n.published_at}
              openInDrawer
            />
          ))}
        </div>
      )}
    </div>
  );
}
