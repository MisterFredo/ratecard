"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/Drawer";

type DrawerType = "news" | "content";

type Props = {
  open: boolean;
  type: DrawerType | null;
  id: string | null;
  onClose: () => void;
};

export default function DrawerContent({
  open,
  type,
  id,
  onClose,
}: Props) {
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
    <Drawer open={open} onClose={onClose}>
      {loading && <p className="text-sm text-gray-500">Chargement…</p>}

      {!loading && data && (
        <article className="space-y-6">

          {/* LABEL PREMIUM */}
          <div>
            <span
              className={`inline-block text-xs uppercase tracking-wide font-medium ${
                data.type === "news"
                  ? "text-ratecard-blue"
                  : "text-ratecard-green"
              }`}
            >
              {data.type === "news" ? "News" : "Analyse"}
            </span>
          </div>

          {/* TITRE */}
          <h1 className="text-2xl font-semibold leading-tight">
            {data.title}
          </h1>

          {/* META */}
          {data.published_at && (
            <p className="text-sm text-gray-500">
              Publié le{" "}
              {new Date(data.published_at).toLocaleDateString("fr-FR")}
            </p>
          )}

          {/* EXCERPT */}
          {data.excerpt && (
            <p className="text-lg text-gray-700">
              {data.excerpt}
            </p>
          )}

          {/* CONTENT */}
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

          {/* CONTEXT */}
          {data.type === "news" && data.company && (
            <div className="pt-6 border-t text-sm text-gray-600">
              Société : <strong>{data.company.NAME}</strong>
            </div>
          )}

          {data.type === "content" && data.events?.length > 0 && (
            <div className="pt-6 border-t text-sm text-gray-600">
              Analyse issue de l’événement :{" "}
              <strong>{data.events.map((e: any) => e.LABEL).join(", ")}</strong>
            </div>
          )}
        </article>
      )}
    </Drawer>
  );
}
