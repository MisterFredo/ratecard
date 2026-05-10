"use client";

import type { FeedBadge } from "@/types/feed";

/* ========================================================= */

type FeedItem = {
  id: string;

  type: "news" | "analysis";

  title: string;

  excerpt?: string | null;

  published_at?: string;

  topics?: any[];

  companies?: any[];

  solutions?: any[];

  universes?: any[];

  news_type?: string | null;
};

type Props = {
  item: FeedItem;

  onClick: () => void;
};

/* =========================================================
   BADGES
========================================================= */

function getBadgeClass(type?: string) {

  switch (type) {

    case "news_type":
      return `
        bg-black
        text-white
      `;

    case "company":
      return `
        bg-blue-50
        text-blue-600
        border
        border-blue-100
      `;

    case "solution":
      return `
        bg-purple-50
        text-purple-600
        border
        border-purple-100
      `;

    case "universe":
      return `
        bg-emerald-50
        text-emerald-600
        border
        border-emerald-100
      `;

    case "topic":
    default:
      return `
        bg-gray-100
        text-gray-600
      `;
  }
}

function buildBadges(
  item: FeedItem
): FeedBadge[] {

  const topics = Array.isArray(item.topics)
    ? item.topics
    : [];

  const companies = Array.isArray(item.companies)
    ? item.companies
    : [];

  const solutions = Array.isArray(item.solutions)
    ? item.solutions
    : [];

  const universes = Array.isArray(item.universes)
    ? item.universes
    : [];

  return [

    ...(item.news_type
      ? [{
          label: item.news_type,
          type: "news_type" as const,
        }]
      : []),

    ...universes.map((u: any) => ({
      id: u.id_universe,
      label: u.label,
      type: "universe" as const,
    })),

    ...companies.map((c: any) => ({
      id: c.id_company,
      label: c.name,
      type: "company" as const,
    })),

    ...topics.map((t: any) => ({
      id: t.id_topic,
      label: t.label,
      type: "topic" as const,
    })),

    ...solutions.map((s: any) => ({
      id: s.id_solution,
      label: s.name,
      type: "solution" as const,
    })),
  ];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FeedItemCard({
  item,
  onClick,
}: Props) {

  const badges = buildBadges(item);

  const formattedDate =
    item.published_at
      ? new Date(
          item.published_at
        ).toLocaleDateString("fr-FR")
      : null;

  const isNews =
    item.type === "news";

  return (

    <div
      onClick={onClick}
      className="
        cursor-pointer
        py-3
        border-b
        border-gray-100
        hover:bg-gray-50
        transition
      "
    >

      {/* =====================================================
          TOP ROW
      ===================================================== */}

      <div className="
        flex
        items-center
        gap-2
        mb-1.5
      ">

        {/* DATE */}

        {formattedDate && (

          <span className="
            text-[11px]
            text-gray-400
            shrink-0
          ">
            {formattedDate}
          </span>

        )}

        {/* TYPE */}

        <span
          className={`
            text-[10px]
            uppercase
            tracking-wide
            px-2
            py-[2px]
            rounded-full
            font-medium
            shrink-0

            ${
              isNews
                ? `
                  bg-blue-50
                  text-blue-700
                `
                : `
                  bg-gray-100
                  text-gray-700
                `
            }
          `}
        >
          {isNews
            ? "News"
            : "Analysis"}
        </span>

      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}

      <h3
        className="
          text-[14px]
          font-medium
          text-gray-900
          leading-snug
        "
      >
        {item.title}
      </h3>

      {/* =====================================================
          EXCERPT
      ===================================================== */}

      {item.excerpt && (

        <p className="
          mt-1.5
          text-sm
          text-gray-600
          leading-relaxed
          line-clamp-2
        ">
          {item.excerpt}
        </p>

      )}

      {/* =====================================================
          BADGES
      ===================================================== */}

      {badges.length > 0 && (

        <div className="
          flex
          flex-wrap
          gap-1.5
          mt-2
        ">

          {badges.map((b, i) => {

            const keyValue =
              "id" in b && b.id
                ? b.id
                : b.label;

            return (

              <span
                key={`${b.type}-${keyValue}-${i}`}
                className={`
                  px-2
                  py-[3px]
                  text-[10px]
                  rounded-full
                  uppercase
                  tracking-wide
                  ${getBadgeClass(b.type)}
                `}
              >
                {b.label}
              </span>

            );
          })}

        </div>

      )}

    </div>
  );
}
