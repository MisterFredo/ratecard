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
  const [openIds, setOpenIds] = useState<string[]>([]);

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

  function toggleExcerpt(id: string) {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

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
    selectedCompanies.forEach((c) =>
      params.append("companies", c)
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
      setSponsorised(json.sponsorised || []);
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
    setSponsorised([]);
    setCursor(null);
    setHasMore(true);
    load(true);
    // eslint-disable-next-line
  }, [searchParams.toString()]);

  return (
    <section className="space-y-12 border-t pt-12">

      {/* =======================================================
          SPONSORISED — 3 EN TÊTE
      ======================================================== */}
      {sponsorised.length > 0 && (
        <div className="space-y-8">
          {sponsorised.map((b) => (
            <article
              key={b.id}
              className="border-l-4 border-black pl-6"
            >
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Partenaire •{" "}
                {new Date(
                  b.published_at
                ).toLocaleDateString("fr-FR")}
              </div>

              <h2 className="text-xl font-serif leading-snug">
                {b.title}
              </h2>

              {b.excerpt && (
                <p className="mt-3 text-sm text-gray-700 max-w-2xl">
                  {b.excerpt}
                </p>
              )}

              <TagsRow
                b={b}
                updateFilters={updateFilters}
              />
            </article>
          ))}
        </div>
      )}

      {/* =======================================================
          FLUX NORMAL
      ======================================================== */}

      <div className="space-y-10">
        {items.map((b) => {
          const isOpen = openIds.includes(b.id);

          return (
            <article
              key={b.id}
              className="border-b pb-6"
            >
              <div className="text-xs text-gray-500 mb-2">
                {new Date(
                  b.published_at
                ).toLocaleDateString("fr-FR")}
              </div>

              <h2
                onClick={() => toggleExcerpt(b.id)}
                className="text-lg font-serif cursor-pointer leading-snug"
              >
                {b.title}
              </h2>

              {isOpen && b.excerpt && (
                <p className="mt-3 text-sm text-gray-700 max-w-2xl">
                  {b.excerpt}
                </p>
              )}

              <TagsRow
                b={b}
                updateFilters={updateFilters}
              />
            </article>
          );
        })}
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-400">
          Chargement…
        </div>
      )}
    </section>
  );
}

/* ============================================================
   TAGS
============================================================ */

function TagsRow({
  b,
  updateFilters,
}: {
  b: BreveItem;
  updateFilters: Function;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 text-xs">

      {/* SOCIÉTÉ */}
      <button
        onClick={() =>
          updateFilters(
            "companies",
            b.company.id_company
          )
        }
        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
      >
        {b.company.name}
      </button>

      {/* TYPE */}
      {b.news_type && (
        <button
          onClick={() =>
            updateFilters("news_types", b.news_type!)
          }
          className="px-2 py-1 bg-violet-100 text-violet-700 rounded"
        >
          {b.news_type}
        </button>
      )}

      {/* TOPICS */}
      {b.topics?.map((t) => (
        <button
          key={t.id_topic}
          onClick={() =>
            updateFilters("topics", t.id_topic)
          }
          className="px-2 py-1 bg-green-100 text-green-700 rounded"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
