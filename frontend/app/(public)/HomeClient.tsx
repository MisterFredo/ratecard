"use client";

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

type MemberItem = {
  id: string;
  name: string;
  description?: string | null;
  visualRectId?: string | null;
};

type Props = {
  news: NewsItem[];
  members: MemberItem[];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({ news, members }: Props) {
  /* ---------------------------------------------------------
     DATA
  --------------------------------------------------------- */

  const sortedNews = [...news].sort(
    (a, b) =>
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime()
  );

  const heroNews = sortedNews[0];
  const otherNews = sortedNews.slice(1, 9); // 8 news max

  const featuredMembers = members.slice(0, 4); // 4 membres max

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div
      className="
        grid grid-cols-1
        lg:grid-cols-4
        gap-6
      "
    >
      {/* =====================================================
          HERO NEWS — 2x2 (DESKTOP)
      ===================================================== */}
      {heroNews && (
        <div className="lg:col-span-2 lg:row-span-2">
          <PartnerSignalCard
            id={heroNews.id}
            title={heroNews.title}
            excerpt={heroNews.excerpt}
            visualRectUrl={heroNews.visual_rect_url}
            companyVisualRectId={heroNews.company_visual_rect_id}
            publishedAt={heroNews.published_at}
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
          MEMBRES (INTÉGRÉS À LA GRILLE)
      ===================================================== */}
      {featuredMembers.map((m) => (
        <div key={m.id}>
          <MemberCard
            id={m.id}
            name={m.name}
            description={m.description}
            visualRectId={m.visualRectId}
          />
        </div>
      ))}
    </div>
  );
}
