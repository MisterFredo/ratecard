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
          HOME ANALYTIQUE — 2 COLONNES
      ===================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ================= LEFT — ANALYSES ================= */}
        <div className="lg:col-span-8 space-y-12">

          {events.map((block) => (
            <div
              key={block.event.id}
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
                      {/* TITRE */}
                      <p className="text-lg font-semibold text-gray-900 leading-snug max-w-3xl">
                        {a.title}
                      </p>

                      {/* META */}
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

                      {/* EXCERPT */}
                      {a.excerpt && (
                        <p className="text-sm text-gray-600 mt-3 max-w-2xl">
                          {a.excerpt}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* ================= RIGHT — CONTEXTE ================= */}
        <aside className="lg:col-span-4 space-y-8">

          {/* LECTURE DE LA SEMAINE */}
          <div className="rounded-xl border border-ratecard-border bg-white p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Lecture de la semaine
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• L’attribution devient un sujet de rentabilité, plus de visibilité</li>
              <li>• L’IA redistribue la valeur entre plateformes et marques</li>
              <li>• Les données produit reprennent un rôle central</li>
            </ul>
          </div>

          {/* ÉVÉNEMENTS ACTIFS */}
          <div className="rounded-xl border border-ratecard-border bg-white p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Événements actifs
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {events.map((e) => (
                <li key={e.event.id} className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        e.event.event_color || "#9CA3AF",
                    }}
                  />
                  {e.event.label}
                  <span className="text-gray-400">
                    ({e.analyses.length})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CHIFFRES STRUCTURANTS */}
          <div className="rounded-xl border border-ratecard-border bg-white p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Chiffres structurants
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• $6,4T de ventes eCommerce retail en 2025</li>
              <li>• +20 % de croissance Retail Media YoY</li>
              <li>• 57 % des ventes eCommerce via mobile</li>
            </ul>
          </div>

        </aside>
      </section>

    </div>
  );
}
