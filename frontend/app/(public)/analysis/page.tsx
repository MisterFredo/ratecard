export const dynamic = "force-dynamic";

import Link from "next/link";

/* =========================================================
   TYPES
========================================================= */

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
  event?: {
    id: string;
    label: string;
    event_color?: string | null;
  } | null;
};

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   LOADER
========================================================= */

async function getAnalyses(): Promise<AnalysisItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/public/analysis/list`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.items || [];
  } catch {
    return [];
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function AnalysisPage() {
  const analyses = await getAnalyses();

  return (
    <div className="space-y-14 md:space-y-16">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Analyses
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Lectures Ratecard issues des événements et signaux du marché.
        </p>
      </section>

      {/* =====================================================
          LISTE EXHAUSTIVE
      ===================================================== */}
      {analyses.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune analyse publiée pour le moment.
        </p>
      ) : (
        <ul className="space-y-6">
          {analyses.map((a) => (
            <li
              key={a.id}
              className="
                rounded-2xl border border-ratecard-border
                bg-white p-4 md:p-5
              "
            >
              <Link
                href={`/analysis/${a.id}`}
                className="block space-y-2"
              >
                {/* EVENT CONTEXT */}
                {a.event && (
                  <div className="flex items-center gap-2">
                    {a.event.event_color && (
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            a.event.event_color,
                        }}
                      />
                    )}
                    <span className="text-xs text-gray-500">
                      {a.event.label}
                    </span>
                  </div>
                )}

                {/* TITLE */}
                <h2 className="font-semibold text-gray-900 hover:underline">
                  {a.title}
                </h2>

                {/* META */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {a.topics?.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-ratecard-light text-gray-600"
                    >
                      {t}
                    </span>
                  ))}

                  {a.key_metrics?.map((m, i) => (
                    <span
                      key={i}
                      className="text-gray-500"
                    >
                      • {m}
                    </span>
                  ))}

                  <span className="text-gray-400">
                    {new Date(
                      a.published_at
                    ).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                {/* EXCERPT */}
                {a.excerpt && (
                  <p className="text-sm text-gray-600 max-w-3xl">
                    {a.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
