"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/Drawer";
import { useDrawer } from "@/contexts/DrawerContext";

export default function DrawerContent() {
  const { state, closeDrawer } = useDrawer();
  const { open, type, id } = state;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !type || !id) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public/${type}/${id}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Erreur chargement drawer", e);
        setData(null);
      }
      setLoading(false);
    }

    load();
  }, [open, type, id]);

  return (
    <Drawer open={open} onClose={closeDrawer}>
      {loading && (
        <p className="text-sm text-gray-500">
          Chargement…
        </p>
      )}

      {!loading && data && (
        <article className="space-y-8">

          {/* =================================================
              LABEL TYPE (PREMIUM)
          ================================================= */}
          <div>
            <span
              className={`inline-block text-xs uppercase tracking-wide font-semibold ${
                data.type === "news"
                  ? "text-ratecard-blue"
                  : "text-ratecard-green"
              }`}
            >
              {data.type === "news" ? "News" : "Analyse"}
            </span>
          </div>

          {/* =================================================
              TITRE
          ================================================= */}
          <h1 className="text-3xl font-bold leading-tight">
            {data.title}
          </h1>

          {/* =================================================
              META
          ================================================= */}
          <div className="text-sm text-gray-500 space-y-1">
            {data.published_at && (
              <div>
                Publié le{" "}
                {new Date(data.published_at).toLocaleDateString("fr-FR")}
              </div>
            )}

            {data.type === "news" && data.company && (
              <div>
                Société :{" "}
                <strong>{data.company.NAME}</strong>
              </div>
            )}

            {data.type === "content" &&
              data.events?.length > 0 && (
                <div>
                  Analyse issue de l’événement{" "}
                  <strong>
                    {data.events
                      .map((e: any) => e.LABEL)
                      .join(", ")}
                  </strong>
                </div>
              )}
          </div>

          {/* =================================================
              EXCERPT (CHAPÔ)
          ================================================= */}
          {data.excerpt && (
            <p className="text-lg text-gray-700 leading-relaxed border-l-4 pl-4 border-gray-200">
              {data.excerpt}
            </p>
          )}

          {/* =================================================
              CORPS — NEWS
          ================================================= */}
          {data.type === "news" && data.body && (
            <div className="prose max-w-none prose-gray">
              {data.body}
            </div>
          )}

          {/* =================================================
              CORPS — ANALYSE
          ================================================= */}
          {data.type === "content" && (
            <div className="space-y-10">

              {/* CONCEPT */}
              {data.concept && (
                <section>
                  <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
                    Concept clé
                  </h2>
                  <p className="text-gray-700">
                    {data.concept}
                  </p>
                </section>
              )}

              {/* CONTENT BODY */}
              {data.content_body && (
                <section className="prose max-w-none prose-gray">
                  {data.content_body}
                </section>
              )}

              {/* CHIFFRES */}
              {data.chiffres && (
                <section>
                  <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
                    Chiffres clés
                  </h2>
                  <p className="text-gray-700">
                    {data.chiffres}
                  </p>
                </section>
              )}

              {/* CITATIONS */}
              {data.citations && (
                <section>
                  <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
                    À retenir
                  </h2>
                  <blockquote className="border-l-4 border-ratecard-green pl-4 italic text-gray-700">
                    {data.citations}
                  </blockquote>
                </section>
              )}
            </div>
          )}
        </article>
      )}
    </Drawer>
  );
}
