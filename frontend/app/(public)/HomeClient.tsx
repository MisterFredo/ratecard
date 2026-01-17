"use client";

import Link from "next/link";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";
import MemberCard from "@/components/members/MemberCard";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_url?: string | null;
  company_visual_rect_id?: string | null;
  published_at: string;
};

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
};

type MemberItem = {
  id: string;
  name: string;
  description?: string | null;
  visualRectId?: string | null;
};

type Props = {
  news: NewsItem[];
  analyses: AnalysisItem[];
  members?: MemberItem[];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({
  news,
  analyses,
  members,
}: Props) {
  /* ---------------------------------------------------------
     DATA
  --------------------------------------------------------- */

  const sortedNews = [...news].sort(
    (a, b) =>
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime()
  );

  const heroNews = sortedNews[0];
  const latestNews = sortedNews.slice(1, 7); // 6 news

  const latestAnalyses = [...analyses]
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, 3);

  const featuredMembers = members?.slice(0, 6) ?? [];

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="space-y-24">

      {/* =====================================================
          HERO NEWS — UNE
      ===================================================== */}
      {heroNews && (
        <section>
          <PartnerSignalCard
            id={heroNews.id}
            title={heroNews.title}
            excerpt={heroNews.excerpt}
            visualRectUrl={heroNews.visual_rect_url}
            companyVisualRectId={heroNews.company_visual_rect_id}
            publishedAt={heroNews.published_at}
            openInDrawer
          />
        </section>
      )}

      {/* =====================================================
          NEWS PARTENAIRES
      ===================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Actualités partenaires
          </h2>
          <Link
            href="/news"
            className="text-sm text-gray-500 hover:underline"
          >
            Voir toutes les news
          </Link>
        </div>

        <div className="
          grid grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">
          {latestNews.map((n) => (
            <PartnerSignalCard
              key={n.id}
              id={n.id}
              title={n.title}
              excerpt={n.excerpt}
              visualRectUrl={n.visual_rect_url}
              companyVisualRectId={n.company_visual_rect_id}
              publishedAt={n.published_at}
              openInDrawer
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          ALLER PLUS LOIN AVEC CURATOR
      ===================================================== */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          Aller plus loin avec Curator
        </h2>

        <ul className="space-y-3">
          {latestAnalyses.map((a) => (
            <li key={a.id}>
              <Link
                href={`/analysis?analysis_id=${a.id}`}
                className="block group"
              >
                <p className="text-sm font-medium text-gray-900 group-hover:underline">
                  {a.title}
                </p>
                {a.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {a.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/analysis"
          className="inline-block text-sm text-gray-600 hover:underline"
        >
          Explorer toutes les analyses →
        </Link>
      </section>

      {/* =====================================================
          MEMBRES PARTENAIRES
      ===================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Membres partenaires
          </h2>
          <Link
            href="/members"
            className="text-sm text-gray-500 hover:underline"
          >
            Voir tous les membres
          </Link>
        </div>

        <div className="
          grid grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">
          {featuredMembers.map((m) => (
            <MemberCard
              key={m.id}
              id={m.id}
              name={m.name}
              description={m.description}
              visualRectId={m.visualRectId}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
