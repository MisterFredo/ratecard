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
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;
  VISUAL_RECT_ID?: string | null;
  PUBLISHED_AT?: string | null;

  ID_COMPANY: string;
  COMPANY_NAME: string;
  IS_PARTNER?: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_id?: string | null;
  published_at: string;

  company: {
    name: string;
    is_partner: boolean;
  };
};

/* =========================================================
   FETCH
========================================================= */

async function fetchNews(): Promise<NewsItemRaw[]> {
  const res = await fetch(`${API_BASE}/news/list`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = await res.json();
  return json.news || [];
}

/* =========================================================
   COMPONENT — CURATOR
========================================================= */

export default function NewsScreen({ mode }: { mode: Mode }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { openDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     LOAD NEWS
  --------------------------------------------------------- */
  useEffect(() => {
    fetchNews().then((rows) => {
      const mapped: NewsItem[] = rows.map((n) => ({
        id: n.ID_NEWS,
        title: n.TITLE,
        excerpt: n.EXCERPT ?? null,
        visual_rect_id: n.VISUAL_RECT_ID ?? null,
        published_at: n.PUBLISHED_AT || "",
        company: {
          name: n.COMPANY_NAME,
          is_partner: n.IS_PARTNER === true,
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

    openDrawer("right", {
      type: "analysis",
      payload: {
        id: newsId,
        source: "news",
      },
    });
  }, [searchParams, openDrawer]);

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
