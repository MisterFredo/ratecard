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
      {loading && <p className="text-sm text-gray-500">Chargement…</p>}

      {!loading && data && (
        <article className="space-y-6">
          <span
            className={`text-xs uppercase tracking-wide font-medium ${
              data.type === "news"
                ? "text-ratecard-blue"
                : "text-ratecard-green"
            }`}
          >
            {data.type === "news" ? "News" : "Analyse"}
          </span>

          <h1 className="text-2xl font-semibold leading-tight">
            {data.title}
          </h1>

          {data.published_at && (
            <p className="text-sm text-gray-500">
              Publié le{" "}
              {new Date(data.published_at).toLocaleDateString("fr-FR")}
            </p>
          )}

          {data.excerpt && (
            <p className="text-lg text-gray-700">
              {data.excerpt}
            </p>
          )}

          {data.type === "news" && data.body && (
            <div className="prose max-w-none">
              {data.body}
            </div>
          )}

          {data.type === "content" && data.content_body && (
            <div className="prose max-w-none">
              {data.content_body}
            </div>
          )}
        </article>
      )}
    </Drawer>
  );
}
