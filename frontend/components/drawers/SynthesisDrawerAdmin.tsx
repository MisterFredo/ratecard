"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { X } from "lucide-react";

type PreviewItem =
  | {
      type: "CHIFFRES";
      items: {
        value: string;
        id_content: string;
        angle_title: string;
      }[];
    }
  | {
      type: "ANALYTIQUE";
      items: {
        id_content: string;
        angle_title: string;
        excerpt?: string;
      }[];
    }
  | {
      type: "CARTOGRAPHIE";
      items: {
        total_analyses: number;
      };
    };

type Props = {
  synthesisId: string;
  onClose: () => void;
};

export default function SynthesisDrawerAdmin({
  synthesisId,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PreviewItem | null>(null);

  /* ---------------------------------------------------------
     LOAD PREVIEW
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(
          `/synthesis/${synthesisId}/preview`
        );
        setPreview(res.synthesis.preview);
      } catch (e) {
        console.error(e);
        alert("Erreur chargement synthèse");
      }

      setLoading(false);
    }

    load();
  }, [synthesisId]);

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* DRAWER */}
      <aside className="relative ml-auto w-full md:w-[720px] bg-white shadow-xl overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-ratecard-blue">
              Aperçu de la synthèse
            </h2>
            {preview && (
              <p className="text-sm text-gray-500 mt-1">
                Type : {preview.type}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-6">
          {loading && (
            <p className="text-sm text-gray-500">
              Chargement…
            </p>
          )}

          {!loading && !preview && (
            <p className="text-sm text-gray-400 italic">
              Aucune donnée disponible.
            </p>
          )}

          {/* =========================
              CHIFFRES
          ========================= */}
          {!loading && preview?.type === "CHIFFRES" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Chiffres clés
              </h3>

              <ul className="space-y-2">
                {preview.items.map((c, i) => (
                  <li
                    key={i}
                    className="border rounded p-3 bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {c.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {c.angle_title}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* =========================
              ANALYTIQUE
          ========================= */}
          {!loading && preview?.type === "ANALYTIQUE" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Angles analysés
              </h3>

              {preview.items.map((a, i) => (
                <div
                  key={i}
                  className="border rounded p-4 bg-gray-50"
                >
                  <h4 className="font-semibold text-gray-900">
                    {a.angle_title}
                  </h4>
                  {a.excerpt && (
                    <p className="text-sm text-gray-600 mt-1">
                      {a.excerpt}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* =========================
              CARTOGRAPHIE
          ========================= */}
          {!loading && preview?.type === "CARTOGRAPHIE" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Cartographie
              </h3>

              <p className="text-sm text-gray-700">
                Nombre total d’analyses couvertes :{" "}
                <strong>
                  {preview.items.total_analyses}
                </strong>
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
