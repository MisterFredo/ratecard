export const dynamic = "force-dynamic";

import Link from "next/link";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;
  COMPANY_NAME?: string;
  PUBLISHED_AT?: string | null;
  VISUAL_RECT_URL: string;
};

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   SAFE FETCH
========================================================= */

async function safeFetch<T>(
  url: string,
  selector: (json: any) => T
): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return selector({});
    const json = await res.json();
    return selector(json);
  } catch {
    return selector({});
  }
}

/* =========================================================
   LOADER
========================================================= */

async function getNews(): Promise<NewsItem[]> {
  return safeFetch(
    `${API_BASE}/news/list`,
    (json) => json.news ?? []
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="space-y-16">

      {/* =====================================================
          HEADER RUBRIQUE
      ===================================================== */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">News</h1>
        <p className="text-gray-600">
          Annonces, partenariats et prises de parole issues
          de l’écosystème Ratecard.
        </p>
      </section>

      {/* =====================================================
          LISTE DES NEWS (AVEC VISUELS)
      ===================================================== */}
      <section className="space-y-12">
        {news.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune news publiée pour le moment.
          </p>
        ) : (
          <ul className="space-y-12">
            {news.map((n) => (
              <li key={n.ID_NEWS}>
                <Link
                  href={`/news/${n.ID_NEWS}`}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {/* VISUEL */}
                  <img
                    src={n.VISUAL_RECT_URL}
                    alt={n.TITLE}
                    className="w-full h-40 object-cover"
                  />

                  {/* TEXTE */}
                  <div className="md:col-span-2 space-y-2">
                    <h2 className="text-xl font-semibold leading-snug hover:underline">
                      {n.TITLE}
                    </h2>

                    {n.EXCERPT && (
                      <p className="text-sm text-gray-700">
                        {n.EXCERPT}
                      </p>
                    )}

                    <div className="text-xs text-gray-400">
                      {n.COMPANY_NAME && (
                        <span>{n.COMPANY_NAME}</span>
                      )}
                      {n.PUBLISHED_AT && (
                        <>
                          {n.COMPANY_NAME && " · "}
                          {new Date(
                            n.PUBLISHED_AT
                          ).toLocaleDateString("fr-FR")}
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}

