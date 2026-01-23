"use client";

import AnalysisCard from "@/components/analysis/AnalysisCard";

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
};

type Props = {
  analyses: AnalysisItem[];
  onOpenAnalysis: (id: string) => void;
};

export default function MyCuratorDashboard({
  analyses,
  onOpenAnalysis,
}: Props) {
  // 6 analyses mises en avant (cohérent grille 3x2)
  const priorityAnalyses = analyses.slice(0, 6);

  return (
    <section className="space-y-10">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          My Curator
        </h1>
        <p className="text-sm text-gray-500">
          Lecture priorisée et intelligente de l’actualité
        </p>
      </header>

      {/* =====================================================
          SIGNALS — MOCK (POUR L’INSTANT)
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* WHAT MATTERS */}
        <div className="rounded-xl border bg-slate-50 p-5">
          <h2 className="text-sm font-semibold mb-3">
            Ce qui compte aujourd’hui
          </h2>

          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Forte accélération des analyses sur la CTV ces 30 derniers jours</li>
            <li>• Google concentre une part croissante des analyses liées à l’agentique</li>
            <li>• La mesure revient comme un angle critique dans plusieurs sujets récents</li>
          </ul>

          <p className="text-xs text-gray-400 mt-4">
            Signaux générés automatiquement (bientôt disponibles)
          </p>
        </div>

        {/* EMERGING ANGLES */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-semibold mb-3">
            Angles émergents
          </h2>

          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Vers une IA agentique intégrée aux plateformes d’achat média</li>
            <li>• Repositionnement des acteurs autour de la durabilité publicitaire</li>
            <li>• Fragmentation des approches de mesure post-cookies</li>
          </ul>

          <p className="text-xs text-gray-400 mt-4">
            Analyse sémantique en cours de déploiement
          </p>
        </div>

      </div>

      {/* =====================================================
          PRIORITY ANALYSES
      ===================================================== */}
      {priorityAnalyses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">
            Analyses à lire en priorité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {priorityAnalyses.map((a) => (
              <AnalysisCard
                key={a.id}
                id={a.id}
                title={a.title}
                excerpt={a.excerpt}
                publishedAt={a.published_at}
                topic={a.topics?.[0]}
                keyMetric={a.key_metrics?.[0]}
                onOpen={onOpenAnalysis}
              />
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
