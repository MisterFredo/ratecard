"use client";

import { useEffect, useState } from "react";
import AnalysisCard from "@/components/analysis/AnalysisCard";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

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
};

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
  const [openedId, setOpenedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyses().then(setAnalyses);
  }, []);

  const latestAnalyses = analyses.slice(0, 5);

  return (
    <div className="space-y-14">

      {/* =====================================================
          MY CURATOR — ENTRY POINT
      ===================================================== */}
      <section className="space-y-6">

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">
            My Curator
          </h1>
          <p className="text-sm text-gray-500">
            Lecture personnalisée et priorisée de l’actualité
          </p>
        </header>

        {/* =========================
            SIGNAL MOCK (PINECONE)
        ========================= */}
        <div className="rounded-xl border bg-slate-50 p-5">
          <h2 className="text-sm font-semibold mb-2">
            Ce qui compte aujourd’hui
          </h2>

          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Forte accélération des analyses sur la CTV ces 30 derniers jours</li>
            <li>• Google concentre une part croissante des analyses liées à l’agentique</li>
            <li>• La mesure revient comme un angle critique dans plusieurs sujets récents</li>
          </ul>

          <p className="text-xs text-gray-400 mt-3">
            Signaux générés automatiquement (bientôt disponibles)
          </p>
        </div>

        {/* =========================
            PRIORITY ANALYSES (REAL)
        ========================= */}
        {latestAnalyses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">
              Analyses à lire en priorité
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {latestAnalyses.map((a) => (
                <AnalysisCard
                  key={a.id}
                  id={a.id}
                  title={a.title}
                  excerpt={a.excerpt}
                  publishedAt={a.published_at}
                  topic={a.topics?.[0]}
                  keyMetric={a.key_metrics?.[0]}
                  onOpen={(id) => setOpenedId(id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* =========================
            EMERGING ANGLES (MOCK)
        ========================= */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-semibold mb-2">
            Angles émergents
          </h2>

          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Vers une IA agentique intégrée aux plateformes d’achat média</li>
            <li>• Repositionnement des acteurs autour de la durabilité publicitaire</li>
            <li>• Fragmentation des approches de mesure post-cookies</li>
          </ul>

          <p className="text-xs text-gray-400 mt-3">
            Analyse sémantique en cours de déploiement
          </p>
        </div>

      </section>

      {/* =====================================================
          ALL ANALYSES — FULL FEED
      ===================================================== */}
      <section className="space-y-6">
        <header>
          <h2 className="text-xl font-semibold">
            Toutes les analyses
          </h2>
        </header>

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
              topic={a.topics?.[0]}
              keyMetric={a.key_metrics?.[0]}
              onOpen={(id) => setOpenedId(id)}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          ANALYSIS DRAWER
      ===================================================== */}
      {openedId && (
        <AnalysisDrawer
          id={openedId}
          onClose={() => setOpenedId(null)}
        />
      )}
    </div>
  );
}

