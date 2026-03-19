"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { X } from "lucide-react";

type AnalysisData = {
  id_content: string;
  title: string;
  signal?: string;
  excerpt?: string;
  content_body?: string;
  chiffres?: string[];
  citations?: string[];
  acteurs_cites?: string[];
  published_at?: string;
};

type Props = {
  id: string;
  onClose: () => void;
};

export default function AnalysisDrawer({ id, onClose }: Props) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/curator/content/${id}`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
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
        onClick={onClose}
      />

      {/* DRAWER */}
      <aside
        className={`
          relative ml-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-start justify-between">
          <div className="space-y-1 max-w-xl">
            <h1 className="text-xl font-semibold text-gray-900">
              {data.title}
            </h1>

            {data.signal && (
              <p className="text-sm text-teal-700 font-medium">
                {data.signal}
              </p>
            )}
          </div>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-8">

          {/* EXCERPT */}
          {data.excerpt && (
            <p className="text-base font-medium text-gray-800 max-w-2xl">
              {data.excerpt}
            </p>
          )}

          {/* BODY */}
          {data.content_body && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: data.content_body,
              }}
            />
          )}

          {/* CHIFFRES */}
          {data.chiffres?.length > 0 && (
            <div>
              <h2 className="text-xs uppercase text-gray-500 mb-2">
                Chiffres clés
              </h2>
              <ul className="space-y-2">
                {data.chiffres.map((c, i) => (
                  <li
                    key={i}
                    className="border rounded p-2 text-sm bg-gray-50"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CITATIONS */}
          {data.citations?.length > 0 && (
            <div>
              <h2 className="text-xs uppercase text-gray-500 mb-2">
                Citations
              </h2>
              <ul className="space-y-2">
                {data.citations.map((c, i) => (
                  <li
                    key={i}
                    className="italic text-sm text-gray-700"
                  >
                    “{c}”
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ACTEURS */}
          {data.acteurs_cites?.length > 0 && (
            <div className="text-sm text-gray-600">
              <strong>Acteurs :</strong>{" "}
              {data.acteurs_cites.join(", ")}
            </div>
          )}

          {/* FOOTER */}
          {data.published_at && (
            <div className="pt-4 border-t text-xs text-gray-400">
              Publié le{" "}
              {new Date(data.published_at).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
