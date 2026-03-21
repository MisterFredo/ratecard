"use client";

import { useMemo } from "react";
import FeedItemCard from "./FeedItemCard";

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
  news_type?: string | null;
};

type Props = {
  items: FeedItem[];
  onClickItem: (item: FeedItem) => void;
};

/* =========================================================
   HELPERS
========================================================= */

function getMonthKey(date?: string) {
  if (!date) return "unknown";

  const d = new Date(date);

  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11

  return `${year}-${month}`;
}

function formatMonthLabel(key: string) {
  if (key === "unknown") return "Autres";

  const [year, month] = key.split("-").map(Number);

  const date = new Date(year, month);

  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  }).toUpperCase();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FeedGroupedByMonth({
  items,
  onClickItem,
}: Props) {

  /* =========================================================
     GROUP BY MONTH
  ========================================================= */

  const grouped = useMemo(() => {
    const map: Record<string, FeedItem[]> = {};

    items.forEach((item) => {
      const key = getMonthKey(item.published_at);

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(item);
    });

    // tri des mois DESC
    return Object.entries(map).sort((a, b) => {
      if (a[0] === "unknown") return 1;
      if (b[0] === "unknown") return -1;

      return b[0].localeCompare(a[0]);
    });

  }, [items]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-8">

      {grouped.map(([monthKey, monthItems]) => (
        <div key={monthKey} className="space-y-3">

          {/* =====================================================
              MONTH HEADER
          ===================================================== */}
          <div className="sticky top-0 z-[5] bg-white py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {formatMonthLabel(monthKey)}
            </h3>
          </div>

          {/* =====================================================
              ITEMS
          ===================================================== */}
          <div className="space-y-3">
            {monthItems.map((item) => (
              <FeedItemCard
                key={item.id}
                item={item}
                onClick={() => onClickItem(item)}
              />
            ))}
          </div>

        </div>
      ))}

    </div>
  );
}
