"use client";

import { useEffect, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type BriefItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;
};

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;

/* =========================================================
   PAGE — BRÈVES
========================================================= */

export default function BrevesPage() {
  const [breves, setBreves] = useState<BriefItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     FETCH BRÈVES
     (pour l’instant = news light côté API)
  --------------------------------------------------------- */
  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE}/news/list`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const items: BriefItem[] = (json.news || []).map((n: any) => ({
          id: n.ID_NEWS,
          title: n.TITLE,
          excerpt: n.EXCERPT ?? null,
          published_at: n.PUBLISHED_AT,
        }));

        // tri sécurité
        items.sort(
          (a, b) =>
            new Date(b.published_at).getTime() -
            new Date(a.published_at).getTime()
        );

        setBreves(items);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------------------------------------------------
     SCROLL INFINI
  --------------------------------------------------------- */
  useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setVisibleCount((prev) =>
          Math.min(prev + PAGE_SIZE, breves.length)
        );
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [breves.length]);

  const visibleBreves = breves.slice(0, visibleCount);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900">
          Brèves du marché
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Panorama chronologique de l’actualité AdTech / Retail Media.
        </p>
      </header>

      {/* =====================================================
          LISTE DES BRÈVES
      ===================================================== */}
      <section className="space-y-8">
        {visibleBreves.map((b) => (
          <article
            key={b.id}
            className="border-b pb-6 last:border-b-0"
          >
            {/* DATE */}
            <div className="text-xs text-gray-400 mb-1">
              {new Date(b.published_at).toLocaleDateString("fr-FR")}
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

        {/* LOADING / FIN */}
        {loading && (
          <div className="text-center text-sm text-gray-400">
            Chargement…
          </div>
        )}

        {!loading && visibleCount >= breves.length && (
          <div className="text-center text-sm text-gray-400 pt-6">
            Fin des brèves
          </div>
        )}
      </section>
    </div>
  );
}
