"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { X } from "lucide-react";

type AnalysisAdminData = {
  ID_CONTENT: string;
  ANGLE_TITLE: string;
  ANGLE_SIGNAL: string;
  EXCERPT?: string | null;
  CHIFFRES?: string[];
  STATUS: string;
  DATE_CREATION?: string;
  PUBLISHED_AT?: string | null;
};

type Props = {
  contentId: string;
  onClose: () => void;
};

export default function AnalysisDrawerAdmin({
  contentId,
  onClose,
}: Props) {
  const [data, setData] = useState<AnalysisAdminData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // 🔒 ADMIN ROUTE — lecture brute, sans HTML
        const res = await api.get(`/content/${contentId}`);
        setData(res.content || res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [contentId]);

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
          relative ml-auto w-full md:w-[600px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {data.ANGLE_TITLE}
            </h1>
            <p className="text-sm text-gray-600">
              {data.ANGLE_SIGNAL}
            </p>
          </div>

          <button onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-6">
          {/* EXCERPT */}
          {data.EXCERPT && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Excerpt
              </h2>
              <p className="text-sm text-gray-800">
                {data.EXCERPT}
              </p>
            </div>
          )}

          {/* CHIFFRES */}
          {data.CHIFFRES && data.CHIFFRES.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Chiffres
              </h2>
              <ul className="space-y-2">
                {data.CHIFFRES.map((c, i) => (
                  <li
                    key={i}
                    className="border rounded p-2 text-sm text-gray-700 bg-gray-50"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* META */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
            <p>
              <strong>Statut :</strong> {data.STATUS}
            </p>
            {data.PUBLISHED_AT && (
              <p>
                <strong>Publié le :</strong>{" "}
                {new Date(
                  data.PUBLISHED_AT
                ).toLocaleDateString("fr-FR")}
              </p>
            )}
            {data.DATE_CREATION && (
              <p>
                <strong>Date éditoriale :</strong>{" "}
                {new Date(
                  data.DATE_CREATION
                ).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
