"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type TopicStat = {
  id_topic: string;
  label: string;
  total_count: number;
};

type TypeStat = {
  news_type?: string | null;
  total_count: number;
};

type CompanyStat = {
  id_company: string;
  name: string;
  is_partner: boolean;
  total_count: number;
};

type Company = {
  id_company: string;
  name: string;
  is_partner?: boolean;
};

type Topic = {
  id_topic: string;
  label: string;
  axis?: string;
};

type BreveItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;
  news_type?: string | null;
  company: Company;
  topics?: Topic[];
};

/* ========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;

/* ========================================================= */

function StatButton({
  label,
  count,
  onClick,
}: {
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-700 hover:underline"
    >
      {label} ({count})
    </button>
  );
}

/* ========================================================= */

export default function BrevesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const topic = searchParams.get("topic");
  const newsType = searchParams.get("news_type");
  const company = searchParams.get("company");

  const [items, setItems] = useState<BreveItem[]>([]);
  const [sponsorised, setSponsorised] = useState<BreveItem[]>([]);

  const [topicsStats, setTopicsStats] = useState<TopicStat[]>([]);
  const [typesStats, setTypesStats] = useState<TypeStat[]>([]);
  const [topCompanies, setTopCompanies] = useState<CompanyStat[]>([]);

  const [totalCount, setTotalCount] = useState<number>(0);

  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /* =========================================================
     FETCH
  ========================================================= */

  async function loadBreves(reset = false) {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
    });

    if (topic) params.append("topic", topic);
    if (newsType) params.append("news_type", newsType);
    if (company) params.append("company", company);
    if (!reset && cursor) params.append("cursor", cursor);

    const res = await fetch(
      `${API_BASE}/news/breves/search?${params.toString()}`,
      { cache: "no-store" }
    );

    const json = await res.json();

    const newItems = json.items || [];

    if (reset) {
      setItems(newItems);
      setSponsorised(json.sponsorised || []);
      setTopicsStats(json.topics_stats || []);
      setTypesStats(json.types_stats || []);
      setTopCompanies(json.top_companies || []);
      setTotalCount(json.total_count || 0);
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }

    if (newItems.length < PAGE_SIZE) {
      setHasMore(false);
      setCursor(null);
    } else {
      setCursor(newItems[newItems.length - 1].published_at);
    }

    setLoading(false);
  }

  /* ========================================================= */

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    loadBreves(true);
    // eslint-disable-next-line
  }, [topic, newsType, company]);

  useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        loadBreves();
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  });

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">

      {/* ================= CONTEXTE ================= */}
      <header>
        <h1 className="text-xl font-semibold text-gray-900">
          {topic || newsType || company || "Marché AdTech / Retail Media"}
        </h1>
        <p className="text-sm text-gray-600">
          {totalCount} signaux
        </p>
      </header>

      {/* ================= TYPES ================= */}
      {typesStats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Types
          </h2>

          <div className="flex flex-wrap gap-4">
            {typesStats.map((t) => (
              <StatButton
                key={t.news_type || "null"}
                label={t.news_type || "Autre"}
                count={t.total_count}
                onClick={() =>
                  router.push(`/breves?news_type=${t.news_type}`)
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= TOPICS ================= */}
      {topicsStats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Thématiques
          </h2>

          <div className="flex flex-wrap gap-4">
            {topicsStats.slice(0, 12).map((t) => (
              <StatButton
                key={t.id_topic}
                label={t.label}
                count={t.total_count}
                onClick={() =>
                  router.push(`/breves?topic=${t.id_topic}`)
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= ACTEURS ================= */}
      {topCompanies.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Acteurs les plus actifs
          </h2>

          <div className="flex flex-wrap gap-4">
            {topCompanies.map((c) => (
              <StatButton
                key={c.id_company}
                label={c.name}
                count={c.total_count}
                onClick={() =>
                  router.push(`/breves?company=${c.id_company}`)
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= SPONSORISÉS ================= */}
      {sponsorised.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Visibilité partenaires
          </h2>

          <div className="space-y-6">
            {sponsorised.map((b) => (
              <article key={b.id} className="border-b pb-4">
                <div className="text-xs text-gray-400 mb-1">
                  {new Date(b.published_at).toLocaleDateString("fr-FR")}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {b.title}
                </h3>
                {b.excerpt && (
                  <p className="mt-1 text-sm text-gray-700">
                    {b.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ================= FLUX ================= */}
      <section className="space-y-8">
        {items.map((b) => (
          <article key={b.id} className="border-b pb-6">
            <div className="text-xs text-gray-400 mb-1">
              {new Date(b.published_at).toLocaleDateString("fr-FR")}
            </div>

            <h2 className="text-base font-semibold text-gray-900">
              {b.title}
            </h2>

            {b.excerpt && (
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
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
    </div>
  );
}
