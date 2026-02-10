"use client";

import { useEffect, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type Topic = {
  label: string;
  axis?: string;
};

type BreveItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;

  company?: string;
  news_type?: string | null;
  topics?: Topic[];
};

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;
const YEARS = [2022, 2023, 2024, 2025, 2026];

/* =========================================================
   BADGE
========================================================= */

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   PAGE — BRÈVES
========================================================= */

export default function BrevesPage() {
  const [year, setYear] = useState<number>(2025);
  const [items, setItems] = useState<BreveItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /* ---------------------------------------------------------
     FETCH
  --------------------------------------------------------- */
  async function loadBreves(reset = false) {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    const params = new URLSearchParams({
      year: String(year),
      limit: String(PAGE_SIZE),
    });

    if (!reset && cursor) {
      params.append("cursor", cursor);
    }

    try {
      const res = await fetch(
        `${API_BASE}/news/breves?${params.toString()}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      const newItems: BreveItem[] = json.items || [];

      setItems((prev) =>
        reset ? newItems : [...prev, ...newItems]
      );

      if (newItems.length < PAGE_SIZE) {
        setHasMore(false);
        setCursor(null);
      } else {
        setCursor(
          newItems[newItems.length - 1].published_at
        );
      }
    } catch (e) {
      console.error("Erreur chargement brèves", e);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     INIT / YEAR CHANGE
  --------------------------------------------------------- */
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    loadBreves(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  /* ---------------------------------------------------------
     SCROLL INFINI
  --------------------------------------------------------- */
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
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="mb-8 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Brèves du marché
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Panorama chronologique de l’actualité AdTech /
            Retail Media.
          </p>
        </div>

        {/* ANNÉES */}
        <div className="flex gap-2 flex-wrap">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                y === year
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </header>

      {/* =====================================================
          LISTE DES BRÈVES
      ===================================================== */}
      <section className="space-y-8">
        {items.map((b) => (
          <article
            key={b.id}
            className="border-b pb-6 last:border-b-0"
          >
            {/* DATE */}
            <div className="text-xs text-gray-400 mb-1">
              {new Date(b.published_at).toLocaleDateString(
                "fr-FR"
              )}
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mb-2">
              {b.company && (
                <Badge className="bg-gray-100 text-gray-700">
                  {b.company}
                </Badge>
              )}

              {b.news_type && (
                <Badge className="bg-violet-100 text-violet-700">
                  {b.news_type}
                </Badge>
              )}

              {b.topics?.map((t, i) => (
                <Badge
                  key={`${b.id}-topic-${i}`}
                  className="bg-green-100 text-green-700"
                >
                  {t.label}
                </Badge>
              ))}
            </div>

            {/* TITLE */}
            <h2 className="text-base font-semibold text-gray-900">
              {b.title}
            </h2>

            {/* EXCERPT */}
            {b.excerpt && (
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                {b.excerpt}
              </p>
            )}
          </article>
        ))}

        {/* STATES */}
        {loading && (
          <div className="text-center text-sm text-gray-400">
            Chargement…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center text-sm text-gray-400">
            Aucune brève pour {year}.
          </div>
        )}

        {!loading && !hasMore && items.length > 0 && (
          <div className="text-center text-sm text-gray-400 pt-6">
            Fin des brèves {year}
          </div>
        )}
      </section>
    </div>
  );
}
