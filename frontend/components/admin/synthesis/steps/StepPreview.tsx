"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Props = {
  synthesisId: string;
  onBack: () => void;
};

type PreviewData = {
  type: "CHIFFRES" | "ANALYTIQUE" | "CARTOGRAPHIE";
  items: any;
};

export default function StepPreview({
  synthesisId,
  onBack,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(
        `/synthesis/${synthesisId}/preview`
      );
      setPreview(res.synthesis.preview);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement aperçu synthèse");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [synthesisId]);

  if (loading || !preview) {
    return <div>Chargement de l’aperçu…</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ratecard-blue">
          Aperçu de la synthèse
        </h2>

        <button
          onClick={onBack}
          className="underline text-gray-600"
        >
          ← Modifier la sélection
        </button>
      </div>

      {/* PREVIEW — CHIFFRES */}
      {preview.type === "CHIFFRES" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Chiffres sélectionnés
          </h3>

          {preview.items.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              Aucun chiffre retenu.
            </p>
          )}

          <ul className="space-y-2">
            {preview.items.map((c: any, i: number) => (
              <li
                key={i}
                className="border rounded p-3 bg-gray-50 text-sm"
              >
                {c.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PREVIEW — ANALYTIQUE */}
      {preview.type === "ANALYTIQUE" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Angles retenus
          </h3>

          <div className="space-y-3">
            {preview.items.map((a: any, i: number) => (
              <div
                key={i}
                className="border rounded p-3 bg-gray-50"
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
        </div>
      )}

      {/* PREVIEW — CARTOGRAPHIE */}
      {preview.type === "CARTOGRAPHIE" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Cartographie
          </h3>

          <div className="border rounded p-4 bg-gray-50 text-sm">
            <p>
              <strong>Nombre d’analyses :</strong>{" "}
              {preview.items.total_analyses}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
