"use client";

import { useEffect, useState } from "react";
import DashboardOverview from "./sections/DashboardOverview";
import DashboardAnalyses from "./sections/DashboardAnalyses";
import DashboardSignals from "./sections/DashboardSignals";
import DashboardTreatments from "./sections/DashboardTreatments";
import DashboardTimeline from "./sections/DashboardTimeline";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type ScopeMeta = {
  label: string;
  description?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function DashboardLayout({ scopeType, scopeId }: Props) {
  const [meta, setMeta] = useState<ScopeMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);

      try {
        const endpoint =
          scopeType === "topic"
            ? `/topic/${encodeURIComponent(scopeId)}`
            : `/company/${encodeURIComponent(scopeId)}`;

        const res = await fetch(`${API_BASE}${endpoint}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();
          setMeta({
            label: json.label || scopeId,
            description: json.description || null,
          });
        }
      } catch (e) {
        console.error(e);
      }

      setLoadingMeta(false);
    }

    loadMeta();
  }, [scopeType, scopeId]);

  return (
    <div className="space-y-10">

      {/* =====================================================
          HEADER — IDENTITÉ DU DASHBOARD
      ===================================================== */}
      <header className="border-b pb-6">
        <h1 className="text-2xl font-semibold">
          {loadingMeta
            ? "Chargement…"
            : meta?.label || scopeId}
        </h1>

        {meta?.description && (
          <p className="text-sm text-gray-500 mt-1">
            {meta.description}
          </p>
        )}
      </header>

      {/* =====================================================
          SECTION A — OVERVIEW
      ===================================================== */}
      <DashboardOverview
        scopeType={scopeType}
        scopeId={scopeId}
      />

      {/* =====================================================
          SECTION B — ANALYSES
      ===================================================== */}
      <DashboardAnalyses
        scopeType={scopeType}
        scopeId={scopeId}
      />

      {/* =====================================================
          SECTION C — SIGNAUX & PATTERNS
      ===================================================== */}
      <DashboardSignals
        scopeType={scopeType}
        scopeId={scopeId}
      />

      {/* =====================================================
          SECTION D — TRAITEMENTS
      ===================================================== */}
      <DashboardTreatments
        scopeType={scopeType}
        scopeId={scopeId}
      />

      {/* =====================================================
          SECTION E — HISTORIQUE
      ===================================================== */}
      <DashboardTimeline
        scopeType={scopeType}
        scopeId={scopeId}
      />

    </div>
  );
}
