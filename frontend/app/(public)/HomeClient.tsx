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

  const hero = sortedNews[0];
  const otherNews = sortedNews.slice(1, 8); // 7 news

  const teaserAnalyses = [...analyses]
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, 3);

  const teaserMembers = members?.slice(0, 3) ?? [];

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div
      className="
        grid grid-cols-1
        md:grid-cols-3
        auto-rows-fr
        gap-6
      "
    >
      {/* =====================================================
          HERO NEWS (desktop only)
      ===================================================== */}
      {hero && (
        <div className="md:col-span-2 md:row-span-2">
          <PartnerSignalCard
            id={hero.id}
            title={hero.title}
            excerpt={hero.excerpt}
            visualRectUrl={hero.visual_rect_url}
            companyVisualRectId={hero.company_visual_rect_id}
            publishedAt={hero.published_at}
            openInDrawer
          />
        </div>
      )}

      {/* =====================================================
          AUTRES NEWS
      ===================================================== */}
      {otherNews.map((n) => (
        <div key={n.id}>
          <PartnerSignalCard
            id={n.id}
            title={n.title}
            excerpt={n.excerpt}
            visualRectUrl={n.visual_rect_url}
            companyVisualRectId={n.company_visual_rect_id}
            publishedAt={n.published_at}
            openInDrawer
          />
        </div>
      ))}

      {/* =====================================================
          MEMBRES (cartes petites)
      ===================================================== */}
      {teaserMembers.map((m) => (
        <div key={m.id}>
          <MemberCard
            id={m.id}
            name={m.name}
            description={m.description}
            visualRectId={m.visualRectId}
          />
        </div>
      ))}

      {/* =====================================================
          ANALYSES (cartes teaser)
      ===================================================== */}
      {teaserAnalyses.map((a) => (
        <div
          key={a.id}
          className="
            cursor-pointer rounded-2xl
            border border-gray-200
            bg-gray-50 p-4
            hover:bg-gray-100 transition
          "
        >
          <Link href={`/analysis?analysis_id=${a.id}`}>
            <h3 className="text-sm font-semibold text-gray-900">
              {a.title}
            </h3>
            {a.excerpt && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                {a.excerpt}
              </p>
            )}
            <span className="mt-3 inline-block text-xs text-gray-400 uppercase">
              Analyse
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
