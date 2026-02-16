"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;

type BreveItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  news_type?: string;
  company: {
    id_company: string;
    name: string;
    is_partner: boolean;
  };
};

export default function BrevesFeed() {
  const searchParams = useSearchParams();

  const [items, setItems] = useState<BreveItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const selectedTopics = searchParams.getAll("topics");
  const selectedTypes = searchParams.getAll("news_types");

  async function load(reset = false) {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
    });

    selectedTopics.forEach((t) =>
      params.append("topics", t)
    );
    selectedTypes.forEach((t) =>
      params.append("news_types", t)
    );

    if (!reset && cursor) {
      params.append("cursor", cursor);
    }

    const res = await fetch(
      `${API_BASE}/news/breves/search?${params.toString()}`,
      { cache: "no-store" }
    );

    const json = await res.json();
    const newItems = json.items || [];

    if (reset) {
      setItems(newItems);
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }

    if (newItems.length < PAGE_SIZE) {
      setHasMore(false);
      setCursor(null);
    } else {
      setCursor(
        newItems[newItems.length - 1].published_at
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    load(true);
    // eslint-disable-next-line
  }, [searchParams.toString()]);

  return (
    <section className="space-y-8 border-t pt-10">

      {items.map((b) => (
        <article
          key={b.id}
          className="border-b pb-6"
        >
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>
              {new Date(
                b.published_at
              ).toLocaleDateString("fr-FR")}
            </span>

            <span className="uppercase tracking-wide">
              {b.news_type}
            </span>
          </div>

          <h2 className="text-lg font-semibold tracking-tight">
            {b.title}
          </h2>

          {b.excerpt && (
            <p className="mt-2 text-sm text-gray-600">
              {b.excerpt}
            </p>
          )}
        </article>
      ))}

      {loading && (
        <div className="text-center text-sm text-gray-400">
          Chargement…
        </div>
      )}

    </section>
  );
}
