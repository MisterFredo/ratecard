"use client";

import { useDrawer } from "@/contexts/DrawerContext";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_url: string;
  published_at: string;
};

type AnalysisLine = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
};

type EventBlock = {
  event: {
    id: string;
    label: string;
    home_label: string;
    event_color?: string | null;
    context_html?: string | null;
  };
  analyses: AnalysisLine[];
};

type Props = {
  news: NewsItem[];
  events: EventBlock[];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({ news, events }: Props) {
  const { openDrawer } = useDrawer();

  return (
    <div className="space-y-16">

      {/* =====================================================
          NEWS — PARTNER SIGNALS (INCHANGÉ)
      ===================================================== */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {news.map((n) => (
            <PartnerSignalCard
              key={n.id}
              id={n.id}
              title={n.title}
              excerpt={n.excerpt}
              visualRectUrl={n.visual_rect_url}
              publishedAt={n.published_at}
              openInDrawer
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          HOME — ÉVÉNEMENTS (MIROIR ANALYSES / CONTEXTE)
      ===================================================== */}
      <section className="space-y-16">
        {events.map((block) => (
          <div
            key={block.event.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >

            {/* ================= CONTEXTE — MOBILE FIRST ================= */}
            {block.event.context_html && (
              <aside className="lg:hidden rounded-xl border border-ratecard-border bg-white p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  À propos de l’événement
                </h4>
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: block.event.context_html,
                  }}
                />
              </aside>
            )}

            {/* ================= LEFT — ANALYSES ================= */}
            <div className="lg:col-span-9">
              <div
                className="
                  relative rounded-2xl border border-ratecard-border
                  bg-white p-6
                "
              >
                {/* BARRE ÉVÉNEMENT */}
                <span
                  className="absolute left-0 top-6 bottom-6 w-1 rounded-full"
                  style={{
                    backgroundColor:
                      block.event.event_color || "#9CA3AF",
                  }}
                />

                <div className="pl-5">

                  {/* HEADER EVENT */}
                  <div className="flex items-center gap-3 mb-8">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          block.event.event_color || "#9CA3AF",
                      }}
                    />
                    <h3 className="text-base font-semibold text-gray-900">
                      {block.event.home_label}
                    </h3>
                  </div>

                  {/* ANALYSES */}
                  <ul className="space-y-6">
                    {block.analyses.map((a) => (
                      <li
                        key={a.id}
                        onClick={() =>
                          openDrawer("analysis", a.id)
                        }
                        className="
                          cursor-pointer pl-4 border-l border-ratecard-border
                          hover:border-gray-400 transition-colors
                        "
                      >
                        <p className="text-lg font-semibold text-gray-900 leading-snug max-w-4xl">
                          {a.title}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {a.topics?.slice(0, 1).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded bg-ratecard-light text-gray-600"
                            >
                              {t}
                            </span>
                          ))}

                          {a.key_metrics?.[0] && (
                            <span>• {a.key_metrics[0]}</span>
                          )}

                          <span className="text-gray-400">
                            {new Date(
                              a.published_at
                            ).toLocaleDateString("fr-FR")}
                          </span>
                        </div>

                        {a.excerpt && (
                          <p className="text-sm text-gray-600 mt-3 max-w-3xl">
                            {a.excerpt}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ================= RIGHT — CONTEXTE (DESKTOP) ================= */}
            {block.event.context_html && (
              <aside className="hidden lg:block lg:col-span-3">
                <div className="rounded-xl border border-ratecard-border bg-white p-5 sticky top-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    À propos de l’événement
                  </h4>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: block.event.context_html,
                    }}
                  />
                </div>
              </aside>
            )}

          </div>
        ))}
      </section>

    </div>
  );
}
