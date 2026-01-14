"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import AnalysisCard from "@/components/analysis/AnalysisCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
  event: {
    id: string;
    label: string;
    home_label?: string;
    event_color?: string;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   FETCH
========================================================= */

async function fetchAnalyses(): Promise<AnalysisItem[]> {
  const res = await fetch(
    `${API_BASE}/public/analysis/list`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

/* =========================================================
   PAGE
========================================================= */

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const { openDrawer } = useDrawer();
  const searchParams = useSearchParams();

  // 🔒 garde-fou anti-réouverture
  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     Chargement des analyses
  --------------------------------------------------------- */
  useEffect(() => {
    fetchAnalyses().then(setAnalyses);
  }, []);

  /* ---------------------------------------------------------
     Ouverture du drawer pilotée par l’URL
     /analysis?analysis_id=XXXX
     → avec protection contre les boucles
  --------------------------------------------------------- */
  useEffect(() => {
    const analysisId = searchParams.get("analysis_id");

    // aucune analyse demandée → reset garde-fou
    if (!analysisId) {
      lastOpenedId.current = null;
      return;
    }

    // déjà ouverte → ne rien faire
    if (lastOpenedId.current === analysisId) {
      return;
    }

    // nouvelle ouverture légitime
    lastOpenedId.current = analysisId;
    openDrawer("analysis", analysisId);

  }, [searchParams, openDrawer]);

  return (
    <div className="space-y-12">

      {/* =====================================================
          ANALYSES — GRILLE
      ===================================================== */}
      <div
        className="
          grid grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {analyses.map((a) => (
          <AnalysisCard
            key={a.id}
            id={a.id}
            title={a.title}
            excerpt={a.excerpt}
            publishedAt={a.published_at}
            event={{
              label: a.event.label,
              homeLabel: a.event.home_label,
              color: a.event.event_color,
            }}
            keyMetric={a.key_metrics?.[0]}
            topic={a.topics?.[0]}
          />
        ))}
      </div>

    </div>
  );
}


