"use client";

import { useDrawer } from "@/contexts/DrawerContext";

type NewsItem = {
  id: string;
  title: string;
  visual_rect_url: string;
  published_at: string;
};

type AnalysisLine = {
  id: string;
  title: string;
  published_at: string;
};

type EventBlock = {
  event: {
    id: string;
    label: string;
    home_label: string;
    color?: string;
  };
  analyses: AnalysisLine[];
};

export default function HomeClient({
  news,
  events,
}: {
  news: NewsItem[];
  events: EventBlock[];
}) {
  const { openDrawer } = useDrawer();

  return (
    <div className="space-y-16">

      {/* =====================================================
          NEWS — CARTES
      ===================================================== */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">
          Dernières annonces du marché
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((n) => (
            <div
              key={n.id}
              className="cursor-pointer group"
              onClick={() => openDrawer("news", n.id)}
            >
              <img
                src={n.visual_rect_url}
                alt={n.title}
                className="w-full h-36 object-cover rounded"
              />
              <h3 className="mt-2 text-sm font-medium group-hover:underline">
                {n.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.published_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          ANALYSES — WORKFLOW PAR ÉVÉNEMENT
      ===================================================== */}
      <section className="space-y-10">
        <h2 className="text-lg font-semibold">
          Lectures Ratecard par événement
        </h2>

        {events.map((block) => (
          <div key={block.event.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: block.event.color || "#999" }}
              />
              <h3 className="font-medium">
                {block.event.home_label}
              </h3>
            </div>

            <ul className="space-y-3">
              {block.analyses.map((a) => (
                <li
                  key={a.id}
                  className="pl-6 border-l border-gray-200 cursor-pointer hover:border-gray-400"
                  onClick={() => openDrawer("content", a.id)}
                >
                  <p className="text-sm font-medium hover:underline">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(a.published_at).toLocaleDateString("fr-FR")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

    </div>
  );
}
