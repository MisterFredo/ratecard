"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import AnalysisCard from "@/components/analysis/AnalysisCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES — alignés avec /api/analysis/list
========================================================= */

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
};

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchAnalyses(): Promise<AnalysisItem[]> {
  const res = await fetch(
    `${API_BASE}/analysis/list`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const json = await res.json();
  return json.items || [];
}

/* =========================================================
   PAGE — ANALYSES (BIBLIOTHÈQUE)
========================================================= */

export default function AnalysisPage() {
  const { openDrawer } = useDrawer();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses().then((items) => {
      setAnalyses(items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-10">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          Analyses
        </h1>
        <p className="text-sm text-gray-500">
          L’ensemble des analyses produites par Curator
        </p>
      </header>

      {/* =====================================================
          STATES
      ===================================================== */}
      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des analyses…
        </p>
      )}

      {!loading && analyses.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucune analyse disponible pour le moment.
        </p>
      )}

      {/* =====================================================
          GRID — ALL ANALYSES
      ===================================================== */}
      {!loading && analyses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {analyses.map((a) => (
            <AnalysisCard
              key={a.id}
              id={a.id}
              title={a.title}
              excerpt={a.excerpt}
              publishedAt={a.published_at}
              topic={a.topics?.[0]}
              keyMetric={a.key_metrics?.[0]}
              onOpen={(id) =>
                openDrawer("right", {
                  type: "analysis",
                  payload: { id },
                })
              }
            />
          ))}
        </div>
      )}

    </div>
  );
}
