"use client";

import DashboardOverview from "./sections/DashboardOverview";
import DashboardAnalyses from "./sections/DashboardAnalyses";
import DashboardSignals from "./sections/DashboardSignals";
import DashboardTreatments from "./sections/DashboardTreatments";
import DashboardTimeline from "./sections/DashboardTimeline";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

export default function DashboardLayout({ scopeType, scopeId }: Props) {
  return (
    <div className="space-y-10">

      {/* =====================================================
          HEADER — IDENTITÉ DU DASHBOARD
      ===================================================== */}
      <header className="border-b pb-6">
        <h1 className="text-2xl font-semibold">
          {scopeType === "topic" ? "Topic" : "Société"} : {scopeId}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Tableau de bord Curator
        </p>
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
