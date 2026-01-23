"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";

import MyCuratorDashboard from "@/components/my-curator/MyCuratorDashboard";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";
import AnalysisCard from "@/components/analysis/AnalysisCard";

/* =========================================================
   TYPES
========================================================= */

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;
  visual_rect_id: string;
  company_name: string;
  is_partner: boolean;
};

type ContextBadge = {
  id: string;
  label: string;
  type: "topic" | "company";
};

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   HELPERS — CONTEXT BADGES
========================================================= */

function getTopTopics(
  analyses: AnalysisItem[],
  limit = 6
): ContextBadge[] {
  const counter: Record<string, number> = {};

  analyses.forEach((a) => {
    a.topics?.forEach((t) => {
      counter[t] = (counter[t] || 0) + 1;
    });
  });

  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label]) => ({
      id: label,
      label,
      type: "topic",
    }));
}

function getTopCompanies(
  news: NewsItem[],
  limit = 6
): ContextBadge[] {
  const counter: Record<string, number> = {};

  news.forEach((n) => {
    if (!n.company_name) return;
    counter[n.company_name] =
      (counter[n.company_name] || 0) + 1;
  });

  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label]) => ({
      id: label,
      label,
      type: "company",
    }));
}

/* =========================================================
   PAGE — MY CURATOR
========================================================= */

export default function MyCuratorPage() {
  const { openDrawer } = useDrawer();

  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  /* ---------------------------------------------------------
     LOAD ANALYSES
  --------------------------------------------------------- */
  useEffect(() => {
    fetch(`${API_BASE}/analysis/list`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setAnalyses(json.items || []));
  }, []);

  /* ---------------------------------------------------------
     LOAD NEWS
  --------------------------------------------------------- */
  useEffect(() => {
    fetch(`${API_BASE}/news/list?limit=12`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const mapped = (json.news || []).map((n: any) => ({
          id: n.ID_NEWS,
          title: n.TITLE,
          excerpt: n.EXCERPT ?? null,
          published_at: n.PUBLISHED_AT,
          visual_rect_id: n.VISUAL_RECT_ID,
          company_name: n.COMPANY_NAME,
          is_partner: n.IS_PARTNER === true,
        }));
        setNews(mapped);
      });
  }, []);

  /* ---------------------------------------------------------
     CONTEXT BADGES (REAL DATA)
  --------------------------------------------------------- */
  const topicBadges = getTopTopics(analyses);
  const companyBadges = getTopCompanies(news);
  const badges = [...topicBadges, ...companyBadges];

  return (
    <div className="space-y-16">

      {/* =====================================================
          MY CURATOR — COCKPIT
      ===================================================== */}
      <MyCuratorDashboard
        analyses={analyses}
        onOpenAnalysis={(id) =>
          openDrawer("right", {
            type: "analysis",
            payload: { id },
          })
        }
      />

      {/* =====================================================
          CONTEXT BADGES — TOPICS & SOCIÉTÉS
      ===================================================== */}
      {badges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">
            Sujets et sociétés clés
          </h2>

          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={`${b.type}-${b.id}`}
                className={`
                  cursor-pointer
                  rounded-full
                  px-3 py-1
                  text-xs
                  border
                  ${
                    b.type === "topic"
                      ? "bg-slate-50 text-slate-700"
                      : "bg-white text-gray-700"
                  }
                `}
              >
                {b.label}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Badges générés automatiquement à partir de l’activité récente
          </p>
        </section>
      )}

      {/* =====================================================
          LATEST NEWS
      ===================================================== */}
      {news.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">
            Dernières news
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {news.slice(0, 6).map((n) => (
              <PartnerSignalCard
                key={n.id}
                id={n.id}
                title={n.title}
                excerpt={n.excerpt}
                visualRectId={n.visual_rect_id}
                companyName={n.company_name}
                isPartner={n.is_partner}
                publishedAt={n.published_at}
                openInDrawer
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          ALL ANALYSES — RECENT
      ===================================================== */}
      {analyses.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-sm font-semibold">
            Analyses récentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {analyses.slice(0, 9).map((a) => (
              <AnalysisCard
                key={a.id}
                id={a.id}
                title={a.title}
                excerpt={a.excerpt}
                publishedAt={a.published_at}
                topic={a.topics?.[0]}
                keyMetric={a.key_metrics?.[0]}
                onOpen={(id) =>
                  openDrawer("right", {
                    type: "analysis",
                    payload: { id },
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
