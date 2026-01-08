"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/Drawer";
import { useDrawer } from "@/contexts/DrawerContext";

export default function DrawerContent() {
  const { state, openDrawer, closeDrawer } = useDrawer();
  const { open, type, id } = state;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!open || !type || !id) return;

    async function load() {
      setLoading(true);
      try {
        // contenu principal
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public/${type}/${id}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        setData(json);

        // navigation contextuelle
        if (type === "news") {
          const r = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/home/news`,
            { cache: "no-store" }
          );
          const j = await r.json();
          setRelated(
            (j.items || []).filter((n: any) => n.id !== id).slice(0, 3)
          );
        }

        if (type === "content" && json.events?.length > 0) {
          const r = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/home/events`,
            { cache: "no-store" }
          );
          const j = await r.json();

          const eventId = json.events[0].ID_EVENT;
          const block = (j.events || []).find(
            (e: any) => e.event.id === eventId
          );

          setRelated(
            (block?.contents || [])
              .filter((c: any) => c.id !== id)
              .slice(0, 4)
          );
        }
      } catch (e) {
        console.error("Erreur chargement drawer", e);
        setData(null);
        setRelated([]);
      }
      setLoading(false);
    }

    load();
  }, [open, type, id]);

  return (
    <Drawer open={open} onClose={closeDrawer}>
      {loading && (
        <p className="text-sm text-gray-500">Chargement…</p>
      )}

      {!loading && data && (
        <article className="space-y-10">

          {/* LABEL */}
          <span
            className={`text-xs uppercase tracking-wide font-semibold ${
              data.type === "news"
                ? "text-ratecard-blue"
                : "text-ratecard-green"
            }`}
          >
            {data.type === "news" ? "News" : "Analyse"}
          </span>

          {/* TITRE */}
          <h1 className="text-3xl font-bold leading-tight">
            {data.title}
          </h1>

          {/* META */}
          <div className="text-sm text-gray-500 space-y-1">
            {data.published_at && (
              <div>
                Publié le{" "}
                {new Date(data.published_at).toLocaleDateString("fr-FR")}
              </div>
            )}

            {data.type === "news" && data.company && (
              <div>
                Société : <strong>{data.company.NAME}</strong>
              </div>
            )}

            {data.type === "content" && data.events?.length > 0 && (
              <div>
                Analyse issue de l’événement{" "}
                <strong>
                  {data.events.map((e: any) => e.LABEL).join(", ")}
                </strong>
              </div>
            )}
          </div>

          {/* EXCERPT */}
          {data.excerpt && (
            <p className="text-lg text-gray-700 border-l-4 pl-4 border-gray-200">
              {data.excerpt}
            </p>
          )}

          {/* BODY */}
          {data.type === "news" && data.body && (
            <div className="prose max-w-none prose-gray">
              {data.body}
            </div>
          )}

          {data.type === "content" && data.content_body && (
            <div className="prose max-w-none prose-gray">
              {data.content_body}
            </div>
          )}

          {/* =================================================
              LIRE AUSSI / DANS LE MÊME ÉVÉNEMENT
          ================================================= */}
          {related.length > 0 && (
            <section className="pt-10 border-t space-y-4">
              <h2 className="text-sm uppercase tracking-wide text-gray-500">
                {data.type === "news"
                  ? "Lire aussi"
                  : "Dans le même événement"}
              </h2>

              <ul className="space-y-2">
                {related.map((r: any) => (
                  <li
                    key={r.id}
                    className="cursor-pointer hover:underline text-sm"
                    onClick={() =>
                      openDrawer(data.type, r.id)
                    }
                  >
                    {r.title}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </Drawer>
  );
}
