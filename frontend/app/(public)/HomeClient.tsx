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
    <div className="space-y-14 md:space-y-16">

      {/* =====================================================
          NEWS — PARTNER SIGNALS (DRAWER)
      ===================================================== */}
      <section className="space-y-4">
        {news.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucune annonce publiée pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {news.map((n) => (
              <PartnerSignalCard
                key={n.id}
                id={n.id}
                title={n.title}
                excerpt={n.excerpt}
                visualRectUrl={n.visual_rect_url}
                publishedAt={n.published_at}
                openInDrawer   // ⬅️ ON GARDE
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          ANALYSES — PAR ÉVÉNEMENT (DRAWER)
      ===================================================== */}
      <section className="space-y-6">
        {events.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucun événement actif pour le moment.
          </p>
        ) : (
          <div className="space-y-8">
            {events.map((block) => (
              <div
                key={block.event.id}
                className="
                  relative rounded-2xl border border-ratecard-border
                  bg-white p-4 md:p-5
                "
              >
                {/* BARRE ÉVÉNEMENT */}
                <span
                  className="absolute left-0 top-5 bottom-5 w-1 rounded-full"
                  style={{
                    backgroundColor:
                      block.event.event_color || "#9CA3AF",
                  }}
                />

                <div className="pl-4 max-w-3xl">
                  {/* HEADER EVENT */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          block.event.event_color || "#9CA3AF",
                      }}
                    />
                    <h3 className="font-semibold text-gray-900">
                      {block.event.home_label}
                    </h3>
                  </div>

                  {/* ANALYSES */}
                  {block.analyses.length === 0 ? (
                    <p className="text-sm text-gray-400 pl-1">
                      Aucune analyse publiée pour le moment.
                    </p>
                  ) : (
                    <ul className="space-y-3">
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
                          <p className="text-sm font-medium text-gray-900 hover:underline">
                            {a.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {a.topics?.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-xs px-2 py-0.5 rounded bg-ratecard-light text-gray-600"
                              >
                                {t}
                              </span>
                            ))}

                            {a.key_metrics?.slice(0, 2).map((m, i) => (
                              <span
                                key={i}
                                className="text-xs text-gray-500"
                              >
                                • {m}
                              </span>
                            ))}

                            <span className="text-xs text-gray-400">
                              {new Date(
                                a.published_at
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>

                          {a.excerpt && (
                            <p className="text-sm text-gray-600 mt-1 max-w-3xl">
                              {a.excerpt}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
