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

export default function AnalysisDrawer({
  id,
}: {
  id: string;
}) {
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
      <aside className="relative ml-auto w-full md:w-[720px] bg-white shadow-xl overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div className="space-y-1">
            {data.event && (
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {data.event.label}
              </span>
            )}
            <h1 className="text-2xl font-semibold leading-tight">
              {data.angle_title}
            </h1>
            <p className="text-sm text-gray-600">
              {data.angle_signal}
            </p>
          </div>

          <button onClick={() => router.back()}>
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-10">
          {data.excerpt && (
            <p className="text-base font-medium text-gray-800">
              {data.excerpt}
            </p>
          )}

          {data.concept && (
            <div className="border-l-4 border-ratecard-blue pl-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-1">
                Concept clé
              </h2>
              <p>{data.concept}</p>
            </div>
          )}

          {data.content_body && (
            <div className="prose prose-sm max-w-none">
              {data.content_body}
            </div>
          )}

          {data.chiffres?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">
                Chiffres clés
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {data.chiffres.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {data.citations?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">
                Citations
              </h2>
              <div className="space-y-3">
                {data.citations.map((c, i) => (
                  <blockquote
                    key={i}
                    className="border-l-2 pl-4 italic text-gray-700"
                  >
                    {c}
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {data.acteurs_cites?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">
                Acteurs cités
              </h2>
              <ul className="text-sm text-gray-600">
                {data.acteurs_cites.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400 pt-4">
            Publié le{" "}
            {new Date(data.published_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </aside>
    </div>
  );
}
