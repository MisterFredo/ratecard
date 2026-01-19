"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;
  VISUAL_RECT_URL: string | null;
  PUBLISHED_AT?: string | null;

  // CONTEXTE SOCIÉTÉ
  ID_COMPANY: string;
  COMPANY_NAME: string;
  MEDIA_LOGO_RECTANGLE_ID?: string | null;

  // si dispo plus tard
  IS_PARTNER?: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   FETCH
========================================================= */

async function fetchNews(): Promise<NewsItem[]> {
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
     Chargement de la liste des news
  --------------------------------------------------------- */
  useEffect(() => {
    fetchNews().then(setNews);
  }, []);

  /* ---------------------------------------------------------
     Ouverture du drawer pilotée par l’URL
     /news?news_id=XXXX
     → mode = route
  --------------------------------------------------------- */
  useEffect(() => {
    const newsId = searchParams.get("news_id");

    // aucun drawer demandé → reset du garde-fou
    if (!newsId) {
      lastOpenedId.current = null;
      return;
    }

    // déjà ouvert → ne rien faire
    if (lastOpenedId.current === newsId) {
      return;
    }

    // nouvelle ouverture légitime — DRAWER DROIT piloté par l’URL
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
              key={n.ID_NEWS}
              id={n.ID_NEWS}
              title={n.TITLE}
              excerpt={n.EXCERPT}
              visualRectUrl={n.VISUAL_RECT_URL}
              companyVisualRectId={n.MEDIA_LOGO_RECTANGLE_ID}
              publishedAt={n.PUBLISHED_AT || ""}
              openInDrawer

              /* 🔑 CONTEXTE PARTENAIRE */
              companyId={n.ID_COMPANY}
              companyName={n.COMPANY_NAME}
              isPartner={n.IS_PARTNER === true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

