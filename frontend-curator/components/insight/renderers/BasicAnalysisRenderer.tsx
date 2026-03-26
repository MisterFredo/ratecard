"use client";

export default function BasicAnalysisRenderer({
  loading,
  analysis,
}: any) {

  if (loading) {
    return (
      <div className="text-xs text-gray-400">
        Génération en cours...
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-xs text-gray-400">
        Clique pour structurer les données
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-800 whitespace-pre-wrap">
      {analysis}
    </div>
  );
}
