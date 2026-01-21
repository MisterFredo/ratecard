"use client";

import { useEffect, useState } from "react";
import AnalysisCard from "@/components/analysis/AnalysisCard";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type AnalysisItem = {
  id_content: string;
  angle_title: string;
  angle_signal: string;
  excerpt?: string;
  published_at: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardAnalyses({ scopeType, scopeId }: Props) {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { openDrawer } = useDrawer();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const params =
        scopeType === "topic"
          ? `topic_id=${encodeURIComponent(scopeId)}`
          : `company_id=${encodeURIComponent(scopeId)}`;

      try {
        const res = await fetch(
          `${API_BASE}/api/content/list?${params}`,
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
  }, [scopeType, scopeId]);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        Analyses
      </h2>

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id_content}
            className="cursor-pointer"
            onClick={() =>
              openDrawer("right", "analysis", item.id_content)
            }
          >
            <AnalysisCard
              id={item.id_content}
              title={item.angle_title}
              excerpt={item.excerpt}
              publishedAt={item.published_at}
              event={{ label: scopeId }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
