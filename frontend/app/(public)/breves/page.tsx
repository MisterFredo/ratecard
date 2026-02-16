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

export default function BrevesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* =========================================================
     PARAMS MULTI SELECT
  ========================================================= */

  const selectedTopics = searchParams.getAll("topics");
  const selectedTypes = searchParams.getAll("news_types");
  const selectedCompanies = searchParams.getAll("companies");

  /* ========================================================= */

  const [items, setItems] = useState<BreveItem[]>([]);
  const [sponsorised, setSponsorised] = useState<BreveItem[]>([]);

  const [topicsStats, setTopicsStats] = useState<TopicStat[]>([]);
  const [typesStats, setTypesStats] = useState<TypeStat[]>([]);
  const [companiesStats, setCompaniesStats] = useState<CompanyStat[]>([]);

  const [totalCount, setTotalCount] = useState<number>(0);
  const [last7, setLast7] = useState<number>(0);
  const [last30, setLast30] = useState<number>(0);

  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [openCompanyPanel, setOpenCompanyPanel] = useState(false);

  /* =========================================================
     UPDATE FILTERS
  ========================================================= */

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

  /* =========================================================
     FETCH
  ========================================================= */

  async function loadBreves(reset = false) {
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

    const newItems = json.items || [];

    if (reset) {
      setItems(newItems);
      setSponsorised(json.sponsorised || []);
      setTopicsStats(json.topics_stats || []);
      setTypesStats(json.types_stats || []);
      setCompaniesStats(json.top_companies || []);
      setTotalCount(json.total_count || 0);
      setLast7(json.last_7_days || 0);
      setLast30(json.last_30_days || 0);
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
  }, [searchParams.toString()]);

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

  /* ========================================================= */

  function toggleItem(id: string) {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">

      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Signaux marché
        </h1>
        <div className="text-sm text-gray-500">
          {totalCount} signaux • {last7} sur 7j • {last30} sur 30j
        </div>
      </header>

      {/* TYPES */}
      {typesStats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">Types</h2>
          <div className="flex flex-wrap gap-3">
            {typesStats.map((t) => {
              const active = selectedTypes.includes(
                t.news_type || ""
              );
              return (
                <button
                  key={t.news_type || "null"}
                  onClick={() =>
                    updateFilters(
                      "news_types",
                      t.news_type || ""
                    )
                  }
                  className={`px-3 py-1 text-xs rounded ${
                    active
                      ? "bg-black text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {t.news_type || "Autre"} ({t.total_count})
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* TOPICS */}
      {topicsStats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">
            Thématiques
          </h2>
          <div className="flex flex-wrap gap-3">
            {topicsStats.slice(0, 15).map((t) => {
              const active = selectedTopics.includes(
                t.id_topic
              );
              return (
                <button
                  key={t.id_topic}
                  onClick={() =>
                    updateFilters("topics", t.id_topic)
                  }
                  className={`px-3 py-1 text-xs rounded ${
                    active
                      ? "bg-black text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {t.label} ({t.total_count})
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* SOCIÉTÉS PANEL BUTTON */}
      <section>
        <button
          onClick={() => setOpenCompanyPanel(true)}
          className="text-sm underline"
        >
          Voir toutes les sociétés
        </button>
      </section>

      {/* SPONSORISÉS */}
      {sponsorised.length > 0 && (
        <section className="border-t pt-10">
          <h2 className="text-sm font-semibold mb-6">
            Visibilité partenaires
          </h2>

          <div className="space-y-6">
            {sponsorised.map((b) => (
              <article
                key={b.id}
                className="border border-blue-200 bg-blue-50 p-6 rounded-lg"
              >
                <div className="text-xs text-blue-600 mb-2">
                  Partenaire •{" "}
                  {new Date(
                    b.published_at
                  ).toLocaleDateString("fr-FR")}
                </div>

                <h3 className="font-semibold">
                  {b.title}
                </h3>

                {b.excerpt && (
                  <p className="mt-3 text-sm text-gray-700">
                    {b.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FLUX */}
      <section className="space-y-10 border-t pt-10">
        {items.map((b) => {
          const isOpen = openItems.includes(b.id);

          return (
            <article key={b.id} className="pb-6 border-b">
              <div className="text-xs text-gray-400 mb-2">
                {new Date(
                  b.published_at
                ).toLocaleDateString("fr-FR")}
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() =>
                    updateFilters(
                      "companies",
                      b.company.id_company
                    )
                  }
                  className="px-2 py-0.5 text-xs bg-gray-100 rounded"
                >
                  {b.company.name}
                </button>

                {b.news_type && (
                  <button
                    onClick={() =>
                      updateFilters(
                        "news_types",
                        b.news_type
                      )
                    }
                    className="px-2 py-0.5 text-xs bg-violet-100 text-violet-700 rounded"
                  >
                    {b.news_type}
                  </button>
                )}

                {b.topics?.map((t) => (
                  <button
                    key={t.id_topic}
                    onClick={() =>
                      updateFilters(
                        "topics",
                        t.id_topic
                      )
                    }
                    className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <h2
                onClick={() => toggleItem(b.id)}
                className="text-base font-semibold cursor-pointer"
              >
                {b.title}
              </h2>

              {isOpen && b.excerpt && (
                <p className="mt-3 text-sm text-gray-700">
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
      </section>

      {/* SOCIÉTÉS PANEL */}
      {openCompanyPanel && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-10">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold">
              Toutes les sociétés
            </h2>
            <button
              onClick={() => setOpenCompanyPanel(false)}
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {companiesStats.map((c) => {
              const active =
                selectedCompanies.includes(
                  c.id_company
                );
              return (
                <button
                  key={c.id_company}
                  onClick={() =>
                    updateFilters(
                      "companies",
                      c.id_company
                    )
                  }
                  className={`p-2 text-left border rounded ${
                    active
                      ? "bg-black text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {c.name} ({c.total_count})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
