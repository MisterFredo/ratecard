"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;
};

type Mode = "focus" | "all";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const FOCUS_LIMIT = 10;

function getScopeQuery(
  scopeType: "topic" | "company",
  scopeId: string
) {
  return scopeType === "topic"
    ? `topic_id=${encodeURIComponent(scopeId)}`
    : `company_id=${encodeURIComponent(scopeId)}`;
}

export default function DashboardAnalyses({
  scopeType,
  scopeId,
}: Props) {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("focus");

  const { openDrawer } = useDrawer();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const scopeQuery = getScopeQuery(scopeType, scopeId);
      const limit =
        mode === "focus" ? `&limit=${FOCUS_LIMIT}` : "";

      try {
        const res = await fetch(
          `${API_BASE}/analysis/list?${scopeQuery}${limit}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Erreur chargement analyses");
        }

        const json = await res.json();
        setItems(json.items || []);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger les analyses");
      }

      setLoading(false);
    }

    load();
  }, [scopeType, scopeId, mode]);

  return (
    <section className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Analyses
        </h2>

        {mode === "focus" && items.length === FOCUS_LIMIT && (
          <button
            onClick={() => setMode("all")}
            className="text-sm text-blue-600 hover:underline"
          >
            Voir toutes
          </button>
        )}

        {mode === "all" && (
          <button
            onClick={() => setMode("focus")}
            className="text-sm text-gray-500 hover:underline"
          >
            Vue réduite
          </button>
        )}
      </div>

      {/* STATES */}
      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des analyses…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucune analyse disponible pour ce périmètre.
        </p>
      )}

      {/* LIST */}
      <div
        className={`divide-y ${
          mode === "all" ? "max-h-[420px] overflow-y-auto" : ""
        }`}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              openDrawer("right", {
                type: "analysis",
                payload: { id: item.id },
              })
            }
            className="
              cursor-pointer
              py-3
              px-1
              hover:bg-gray-50
              transition
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium leading-snug">
                  {item.title}
                </div>

                {item.excerpt && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.excerpt}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 whitespace-nowrap pt-0.5">
                {new Date(item.published_at).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
