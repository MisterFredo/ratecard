"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";

type AnalysisData = {
  id_content: string;
  angle_title: string;
  angle_signal: string;
  excerpt?: string | null;
  concept?: string | null;
  content_body?: string | null;
  chiffres: string[];
  citations: string[];
  acteurs_cites: string[];
  published_at: string;
  event?: {
    id: string;
    label: string;
  } | null;
};

export default function AnalysisDrawer({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/public/content/${id}`);
        setData(res);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => router.back()}
      />

      {/* DRAWER */}
      <aside className="relative ml-auto w-full md:w-[760px] bg-white shadow-xl overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div className="space-y-2 max-w-xl">
            {data.event && (
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {data.event.label}
              </span>
            )}

            <h1 className="text-2xl font-semibold leading-tight text-gray-900">
              {data.angle_title}
            </h1>

            <p className="text-sm text-gray-600">
              {data.angle_signal}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-12">

          {/* EXCERPT */}
          {data.excerpt && (
            <div className="text-base font-medium text-gray-800 max-w-2xl">
              {data.excerpt}
            </div>
          )}

          {/* CONCEPT */}
          {data.concept && (
            <section className="border-l-4 border-ratecard-blue pl-4 max-w-2xl">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Concept clé
              </h2>
              <p className="text-sm text-gray-700">
                {data.concept}
              </p>
            </section>
          )}

          {/* ANALYSE DÉTAILLÉE */}
          {data.content_body && (
            <section className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: data.content_body,
                }}
              />
            </section>
          )}

          {/* CHIFFRES CLÉS */}
          {data.chiffres?.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Chiffres clés
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.chiffres.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-ratecard-border p-3 text-sm text-gray-700 bg-ratecard-light"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CITATIONS */}
          {data.citations?.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Citations
              </h2>
              <div className="space-y-4">
                {data.citations.map((c, i) => (
                  <blockquote
                    key={i}
                    className="border-l-2 border-gray-300 pl-4 italic text-sm text-gray-700 max-w-2xl"
                  >
                    {c}
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* ACTEURS CITÉS */}
          {data.acteurs_cites?.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Acteurs cités
              </h2>
              <ul className="flex flex-wrap gap-2">
                {data.acteurs_cites.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded bg-ratecard-light text-gray-600"
                  >
                    {a}
                  </span>
                ))}
              </ul>
            </section>
          )}

          {/* FOOTER */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Publié le{" "}
              {new Date(
                data.published_at
              ).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

