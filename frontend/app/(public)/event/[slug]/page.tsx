export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

/* =========================================================
   TYPES
========================================================= */

type EventData = {
  id_event: string;
  label: string;
  home_label: string;
  description?: string | null;
  visual_rect_url: string;
};

type ContentItem = {
  id: string;
  title: string;
  excerpt: string;
  published_at: string;
};

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   LOADERS
========================================================= */

async function getEvent(slug: string): Promise<EventData | null> {
  try {
    const res = await fetch(
      `${API_BASE}/public/event/${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getEventContents(slug: string): Promise<ContentItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/public/event/${slug}/contents`,
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

export default async function EventPage({
  params,
}: {
  params: { slug: string };
}) {
  const { openDrawer } = useDrawer();

  const event = await getEvent(params.slug);
  if (!event) notFound();

  const contents = await getEventContents(params.slug);

  return (
    <div className="space-y-16">

      {/* =====================================================
          HEADER EVENT (RUBRIQUE)
      ===================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <img
          src={event.visual_rect_url}
          alt={event.label}
          className="w-full h-72 object-cover"
        />

        <div className="space-y-4">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Événement
          </span>

          <h1 className="text-3xl font-bold leading-tight">
            {event.home_label}
          </h1>

          {event.description && (
            <p className="text-gray-700 text-base">
              {event.description}
            </p>
          )}

          {/* CTA EVENT */}
          <a
            href={`/events/${params.slug}/register`}
            className="inline-block text-ratecard-green font-medium hover:underline"
          >
            S’inscrire à l’événement
          </a>
        </div>
      </section>

      {/* =====================================================
          ANALYSES
      ===================================================== */}
      <section className="space-y-10">
        <h2 className="text-xl font-semibold">
          Analyses liées à cet événement
        </h2>

        {contents.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun contenu publié pour le moment.
          </p>
        ) : (
          <ul className="space-y-6">
            {contents.map((c) => (
              <li
                key={c.id}
                className="cursor-pointer"
                onClick={() =>
                  openDrawer("content", c.id)
                }
              >
                <h3 className="font-medium hover:underline">
                  {c.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {c.excerpt}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
