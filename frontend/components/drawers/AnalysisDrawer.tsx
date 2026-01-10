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

type Props = {
  id: string;
  onClose?: () => void;
};

export default function AnalysisDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/public/content/${id}`);
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
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={close}
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
            {data.event && (
              <span className="text-xs uppercase tracking-wide text-gray-400">
                {data.event.label}
              </span>
            )}

            <h1 className="text-xl font-semibold leading-tight text-gray-900">
              {data.angle_title}
            </h1>

            <p className="text-sm text-gray-600">
              {data.angle_signal}
            </p>
          </div>

          <button
            onClick={close}
            aria-label="Fermer"
            className="mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-8">

          {/* EXCERPT */}
          {data.excerpt && (
            <p className="text-base font-medium text-gray-800">
              {data.excerpt}
            </p>
          )}

          {/* CONCEPT */}
          {data.concept && (
            <div className="border-l-4 border-ratecard-blue pl-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Concept clé
              </h2>
              <p className="text-sm text-gray-700">
                {data.concept}
              </p>
            </div>
          )}

          {/* BODY — HTML RENDER */}
          {data.content_body && (
            <div
              className="
                prose prose-sm max-w-none
                prose-p:my-4
                prose-ul:my-4
                prose-ol:my-4
                prose-li:my-1
                prose-strong:font-semibold
                prose-a:text-ratecard-blue
                prose-a:no-underline
                hover:prose-a:underline
              "
              dangerouslySetInnerHTML={{
                __html: data.content_body,
              }}
            />
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
                    className="rounded-lg border border-ratecard-border bg-ratecard-light p-3 text-sm text-gray-700"
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
                    className="border-l-2 border-gray-300 pl-4 italic text-sm text-gray-700"
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
          <div className="pt-4 border-t border-gray-200">
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
