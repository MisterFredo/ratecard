"use client";

import PartnerSignalCard from "@/components/news/PartnerSignalCard";
import MemberCard from "@/components/members/MemberCard";

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

export default function HomeClient({ news, members }: Props) {
  const sortedNews = [...news].sort(
    (a, b) =>
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime()
  );

  const featuredNews = sortedNews[0];
  const otherNews = sortedNews.slice(1, 10);
  const featuredMembers = members.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-20">

      {/* =====================================================
          UNE — même grille, style éditorial
      ===================================================== */}
      <section
        className="
          grid grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        "
      >
        {featuredNews && (
          <PartnerSignalCard
            id={featuredNews.id}
            title={featuredNews.title}
            excerpt={featuredNews.excerpt}
            visualRectUrl={featuredNews.visual_rect_url}
            companyVisualRectId={featuredNews.company_visual_rect_id}
            publishedAt={featuredNews.published_at}
            openInDrawer
            variant="featured"
          />
        )}

        {otherNews.map((n) => (
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
      </section>

      {/* =====================================================
          MEMBRES PARTENAIRES — bloc séparé
      ===================================================== */}
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
    </div>
  );
}
