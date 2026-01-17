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
  const heroSideNews = sortedNews.slice(1, 3); // 2 news à droite
  const latestNews = sortedNews.slice(3, 9);  // 6 news

  const featuredMembers = members.slice(0, 6);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-20">

      {/* =====================================================
          BLOC 1 — À LA UNE
          Inspiré Le Monde (2/3 + 1/3)
      ===================================================== */}
      {heroNews && (
        <section
          className="
            grid grid-cols-1
            lg:grid-cols-3
            gap-6
          "
        >
          {/* HERO PRINCIPAL (2 colonnes) */}
          <div className="lg:col-span-2">
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

          {/* HERO SECONDAIRE (colonne droite) */}
          <div className="space-y-6">
            {heroSideNews.map((n) => (
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
      )}

      {/* =====================================================
          BLOC 2 — DERNIÈRES ACTUALITÉS PARTENAIRES
      ===================================================== */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          Dernières actualités partenaires
        </h2>

        <div
          className="
            grid grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
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
          BLOC 3 — MEMBRES PARTENAIRES
      ===================================================== */}
      {featuredMembers.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Membres partenaires
          </h2>

          <div
            className="
              grid grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >
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
      )}
    </div>
  );
}
