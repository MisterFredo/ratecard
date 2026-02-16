"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type Topic = {
  id_topic: string;
  label: string;
  axis?: string;
};

type Company = {
  id_company: string;
  name: string;
  is_partner?: boolean;
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

type CompanyStat = {
  ID_COMPANY: string;
  NAME: string;
  IS_PARTNER: boolean;
  TOTAL: number;
};

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PAGE_SIZE = 20;

/* =========================================================
   BADGE
========================================================= */

function Badge({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${className}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   PAGE — BRÈVES (MOTEUR)
========================================================= */

export default function BrevesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const topic = searchParams.get("topic");
  const newsType = searchParams.get("news_type");
  const company = searchParams.get("company");

  const [items, setItems] = useState<BreveItem[]>([]);
  const [sponsorised, setSponsorised] = useState<BreveItem[]>([]);
  const [topCompanies, setTopCompanies] = useState<CompanyStat[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

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
      limit: String(PAGE_SIZE),
    });

    if (topic) params.append("topic", topic);
    if (newsType) params.append("news_type", newsType);
    if (company) params.append("company", company);
    if (!reset && cursor) params.append("cursor", cursor);

    try {
      const res = await fetch(
        `${API_BASE}/news/breves/search?${params.toString()}`,
        { cache: "no-store" }
      );

      const json = await res.json();

      const newItems = json.items || [];

      if (reset) {
        setItems(newItems);
        setSponsorised(json.sponsorised || []);
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
    } catch (e) {
      console.error("Erreur chargement brèves", e);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     RELOAD ON FILTER CHANGE
  --------------------------------------------------------- */
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    loadBreves(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, newsType, company]);

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
          CONTEXTE
      ===================================================== */}
      <header className="mb-8 space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">
          {topic || newsType || company || "Marché AdTech / Retail Media"}
        </h1>
        <p className="text-sm text-gray-600">
          {totalCount} signaux
        </p>
      </header>

      {/* =====================================================
          TOP SOCIÉTÉS
      ===================================================== */}
      {topCompanies.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Acteurs les plus actifs
          </h2>

          <div className="flex flex-wrap gap-3">
            {topCompanies.map((c) => (
              <button
                key={c.ID_COMPANY}
                onClick={() =>
                  router.push(`/breves?company=${c.ID_COMPANY}`)
                }
                className="text-sm text-gray-700 hover:underline"
              >
                {c.NAME} ({c.TOTAL})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          SPONSORISATION
      ===================================================== */}
      {sponsorised.length > 0 && (
        <section className="mb-10">
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

      {/* =====================================================
          FLUX PRINCIPAL
      ===================================================== */}
      <section className="space-y-8">
        {items.map((b) => (
          <article key={b.id} className="border-b pb-6">
            <div className="text-xs text-gray-400 mb-1">
              {new Date(b.published_at).toLocaleDateString("fr-FR")}
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              <Badge
                className="bg-gray-100 text-gray-700"
                onClick={() =>
                  router.push(`/breves?company=${b.company.id_company}`)
                }
              >
                {b.company.name}
              </Badge>

              {b.news_type && (
                <Badge
                  className="bg-violet-100 text-violet-700"
                  onClick={() =>
                    router.push(`/breves?news_type=${b.news_type}`)
                  }
                >
                  {b.news_type}
                </Badge>
              )}

              {b.topics?.map((t) => (
                <Badge
                  key={t.id_topic}
                  className="bg-green-100 text-green-700"
                  onClick={() =>
                    router.push(`/breves?topic=${t.id_topic}`)
                  }
                >
                  {t.label}
                </Badge>
              ))}
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

        {!loading && items.length === 0 && (
          <div className="text-center text-sm text-gray-400">
            Aucun signal trouvé.
          </div>
        )}
      </section>
    </div>
  );
}
