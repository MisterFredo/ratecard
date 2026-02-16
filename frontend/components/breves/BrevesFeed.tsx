"use client";

import { useEffect, useState, useRef } from "react";
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
  const observerRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          load();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [cursor, hasMore]);

  function toggleItem(id: string) {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  return (
    <section className="space-y-6">

      {/* ============================= */}
      {/* ACTUALITÉS MEMBRES */}
      {/* ============================= */}
      {sponsorised.length > 0 && (
        <div className="border border-gray-200 rounded-md p-4">

          <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-3">
            Actualités membres
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {sponsorised.map((b) => (
              <article key={b.id} className="space-y-1.5">

                <div className="text-[11px] text-gray-400">
                  {new Date(b.published_at).toLocaleDateString("fr-FR")}
                </div>

                <div
                  className={`text-[11px] uppercase tracking-wide ${
                    b.company.is_partner
                      ? "text-emerald-600"
                      : "text-gray-500"
                  }`}
                >
                  {b.company.name}
                </div>

                <h3 className="text-sm font-medium leading-snug">
                  {b.title}
                </h3>

                {b.excerpt && (
                  <p className="text-xs text-gray-600 leading-relaxed">
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
      <div className="space-y-4">

        {items.map((b) => {
          const isOpen = openItems.includes(b.id);

          return (
            <article
              key={b.id}
              className="border-b border-gray-100 pb-4"
            >

              {/* META */}
              <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                <span>
                  {new Date(b.published_at).toLocaleDateString("fr-FR")}
                </span>

                {b.news_type && (
                  <span className="uppercase tracking-wide text-gray-500">
                    {b.news_type}
                  </span>
                )}
              </div>

              {/* COMPANY */}
              <div className="mb-0.5">
                <button
                  onClick={() =>
                    updateFilters("companies", b.company.id_company)
                  }
                  className={`text-xs font-medium transition ${
                    b.company.is_partner
                      ? "text-emerald-600 hover:text-emerald-700"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  {b.company.name}
                </button>
              </div>

              {/* TITLE */}
              <h2
                onClick={() => toggleItem(b.id)}
                className="text-[15px] font-medium leading-snug cursor-pointer hover:text-gray-900 transition"
              >
                {b.title}
              </h2>

              {/* TAGS */}
              {b.topics && b.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {b.topics.map((t) => (
                    <button
                      key={t.id_topic}
                      onClick={() =>
                        updateFilters("topics", t.id_topic)
                      }
                      className="text-[11px] px-2 py-[3px] bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* EXCERPT */}
              {isOpen && b.excerpt && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-3xl">
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

        {hasMore && <div ref={observerRef} className="h-6" />}
      </div>
    </section>
  );
}
