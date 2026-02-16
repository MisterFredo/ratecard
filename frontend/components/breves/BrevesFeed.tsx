"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;

type Topic = {
  id_topic: string;
  label: string;
};

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
  topics?: Topic[];
};

export default function BrevesFeed() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<BreveItem[]>([]);
  const [sponsorised, setSponsorised] = useState<BreveItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const selectedTopics = searchParams.getAll("topics");
  const selectedTypes = searchParams.getAll("news_types");
  const selectedCompanies = searchParams.getAll("companies");

  function updateFilters(
    key: "topics" | "news_types" | "companies",
    value: string
  ) {
    const params = new URLSearchParams(searchParams.toString());
    const values = params.getAll(key);

    if (values.includes(value)) {
      params.delete(key);
      values
        .filter((v) => v !== value)
        .forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }

    router.push(`/breves?${params.toString()}`);
  }

  async function load(reset = false) {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
    });

    selectedTopics.forEach((t) => params.append("topics", t));
    selectedTypes.forEach((t) => params.append("news_types", t));
    selectedCompanies.forEach((c) => params.append("companies", c));

    if (!reset && cursor) {
      params.append("cursor", cursor);
    }

    const res = await fetch(
      `${API_BASE}/news/breves/search?${params.toString()}`,
      { cache: "no-store" }
    );

    const json = await res.json();

    if (reset) {
      setItems(json.items || []);
      setSponsorised(json.sponsorised || []);
    } else {
      setItems((prev) => [...prev, ...(json.items || [])]);
    }

    const newItems = json.items || [];

    if (newItems.length < PAGE_SIZE) {
      setHasMore(false);
      setCursor(null);
    } else {
      setCursor(newItems[newItems.length - 1].published_at);
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

  function toggleItem(id: string) {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  return (
    <section className="space-y-16">

      {/* ============================= */}
      {/* SPONSORISED */}
      {/* ============================= */}
      {sponsorised.length > 0 && (
        <div className="border border-black p-8 bg-white">
          <div className="text-xs uppercase tracking-widest text-red-600 mb-6">
            Visibilité partenaires
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sponsorised.map((b) => (
              <article key={b.id} className="space-y-3">
                <div className="text-xs text-gray-500">
                  {new Date(b.published_at).toLocaleDateString("fr-FR")}
                </div>

                <h3 className="font-semibold leading-snug">
                  {b.title}
                </h3>

                {b.excerpt && (
                  <p className="text-sm text-gray-600">
                    {b.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ============================= */}
      {/* MAIN FEED */}
      {/* ============================= */}
      <div className="border-t border-black pt-10 space-y-12">

        {items.map((b) => {
          const isOpen = openItems.includes(b.id);

          return (
            <article key={b.id} className="border-b pb-8">

              {/* META */}
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>
                  {new Date(b.published_at).toLocaleDateString("fr-FR")}
                </span>

                {b.news_type && (
                  <span className="uppercase tracking-wider">
                    {b.news_type}
                  </span>
                )}
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mb-4">

                {/* Company */}
                <button
                  onClick={() =>
                    updateFilters("companies", b.company.id_company)
                  }
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  {b.company.name}
                </button>

                {/* Type */}
                {b.news_type && (
                  <button
                    onClick={() =>
                      updateFilters("news_types", b.news_type!)
                    }
                    className="px-2 py-1 text-xs bg-violet-100 text-violet-700 rounded"
                  >
                    {b.news_type}
                  </button>
                )}

                {/* Topics */}
                {b.topics?.map((t) => (
                  <button
                    key={t.id_topic}
                    onClick={() =>
                      updateFilters("topics", t.id_topic)
                    }
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TITLE */}
              <h2
                onClick={() => toggleItem(b.id)}
                className="text-xl font-semibold leading-snug cursor-pointer hover:underline"
              >
                {b.title}
              </h2>

              {/* EXCERPT */}
              {isOpen && b.excerpt && (
                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  {b.excerpt}
                </p>
              )}
            </article>
          );
        })}

        {loading && (
          <div className="text-center text-sm text-gray-400">
            Chargement…
          </div>
        )}

      </div>
    </section>
  );
}
