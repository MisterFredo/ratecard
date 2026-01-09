export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;
  event?: {
    id: string;
    label: string;
    event_color?: string | null;
  };
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

import Link from "next/link";

export default async function AnalysisPage() {
  const analyses = await getAnalyses();

  return (
    <div className="space-y-12">

      {/* HEADER */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Analyses</h1>
        <p className="text-gray-600">
          Lectures Ratecard issues des événements et signaux du marché.
        </p>
      </section>

      {/* LISTE */}
      {analyses.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucune analyse publiée pour le moment.
        </p>
      ) : (
        <ul className="space-y-6">
          {analyses.map((a) => (
            <li key={a.id}>
              <Link
                href={`/analysis/${a.id}`}
                className="block pl-4 border-l border-gray-200 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  {a.event?.event_color && (
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: a.event.event_color,
                      }}
                    />
                  )}
                  {a.event && (
                    <span className="text-xs text-gray-500">
                      {a.event.label}
                    </span>
                  )}
                </div>

                <h2 className="font-medium hover:underline">
                  {a.title}
                </h2>

                {a.excerpt && (
                  <p className="text-sm text-gray-600">
                    {a.excerpt}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(
                    a.published_at
                  ).toLocaleDateString("fr-FR")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
