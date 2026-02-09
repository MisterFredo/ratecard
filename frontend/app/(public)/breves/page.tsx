"use client";

import { useEffect, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type Topic = {
  label: string;
  axis?: string;
};

type BriefItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;

  // badges
  company?: string;
  newsKind?: "NEWS" | "BRIEF";
  newsType?: string | null;
  topics?: Topic[];
};

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;

/* =========================================================
   BADGES
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
  const [breves, setBreves] = useState<BriefItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     FETCH BRÈVES
  --------------------------------------------------------- */
  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE}/news/list`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const items: BriefItem[] = (json.news || [])
          // on affiche surtout les BRÈVES,
          // mais on ne bloque pas si une NEWS arrive
          .map((n: any) => ({
            id: n.ID_NEWS,
            title: n.TITLE,
            excerpt: n.EXCERPT ?? null,
            published_at: n.PUBLISHED_AT,

            company: n.COMPANY_NAME,
            newsKind: n.NEWS_KIND,
            newsType: n.NEWS_TYPE ?? null,
            topics: n.TOPICS || [],
          }))
          .sort(
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
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900">
          Brèves du marché
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Panorama chronologique de l’actualité AdTech / Retail Media.
        </p>
      </header>

      {/* LISTE */}
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

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mb-2">
              {/* SOCIÉTÉ */}
              {b.company && (
                <Badge className="bg-gray-100 text-gray-700">
                  {b.company}
                </Badge>
              )}

              {/* NEWS_KIND */}
              {b.newsKind && (
                <Badge
                  className={
                    b.newsKind === "BRIEF"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }
                >
                  {b.newsKind === "BRIEF"
                    ? "Brève"
                    : "News"}
                </Badge>
              )}

              {/* NEWS_TYPE */}
              {b.newsType && (
                <Badge className="bg-violet-100 text-violet-700">
                  {b.newsType}
                </Badge>
              )}

              {/* TOPICS */}
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
