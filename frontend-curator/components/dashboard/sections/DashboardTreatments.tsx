"use client";

import { useEffect, useState } from "react";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type TreatmentItem = {
  id: string;
  type: string;
  title: string;
  date_from?: string;
  date_to?: string;
  created_at: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getScopeQuery(
  scopeType: "topic" | "company",
  scopeId: string
) {
  return scopeType === "topic"
    ? `topic_id=${encodeURIComponent(scopeId)}`
    : `company_id=${encodeURIComponent(scopeId)}`;
}

export default function DashboardTreatments({
  scopeType,
  scopeId,
}: Props) {
  const [items, setItems] = useState<TreatmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const scopeQuery = getScopeQuery(scopeType, scopeId);

      try {
        const res = await fetch(
          `${API_BASE}/analysis/treatments?${scopeQuery}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const json = await res.json();
          setItems(json.treatments || []);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    load();
  }, [scopeType, scopeId]);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        Traitements disponibles
      </h2>

      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des traitements…
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucun traitement disponible pour ce périmètre.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {t.title || t.type}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Créé le{" "}
                    {new Date(t.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {t.type}
                </span>
              </div>

              {(t.date_from || t.date_to) && (
                <div className="text-xs text-gray-500 mt-2">
                  Période :{" "}
                  {t.date_from || "—"} → {t.date_to || "—"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
