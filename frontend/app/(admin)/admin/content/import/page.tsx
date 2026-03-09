"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ContentImportPage() {
  const [archiveUrl, setArchiveUrl] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [maxArticles, setMaxArticles] = useState(50);
  const [dateMin, setDateMin] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!archiveUrl || !sourceId) {
      alert("Archive URL et Source obligatoires");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/content/raw/import-archive", {
        source_id: sourceId,
        archive_url: archiveUrl,
        max_articles: maxArticles,
        date_min: dateMin || null,
      });

      setResult(res.result);
    } catch (e) {
      console.error(e);
      alert("Erreur import");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ratecard-blue">
        Importer archive
      </h1>

      <div className="space-y-4 max-w-xl">

        <input
          type="text"
          placeholder="Source ID"
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <input
          type="text"
          placeholder="Archive URL"
          value={archiveUrl}
          onChange={(e) => setArchiveUrl(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <input
          type="number"
          value={maxArticles}
          onChange={(e) => setMaxArticles(Number(e.target.value))}
          className="border p-2 w-full rounded"
        />

        <input
          type="date"
          value={dateMin}
          onChange={(e) => setDateMin(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          {loading ? "Import en cours..." : "Importer"}
        </button>

        {result && (
          <div className="bg-gray-100 p-4 rounded text-sm">
            <div>Total trouvés: {result.total_found}</div>
            <div>Insérés: {result.inserted}</div>
            <div>Ignorés (existants): {result.skipped_existing}</div>
            <div>Arrêt par date: {result.stopped_by_date ? "Oui" : "Non"}</div>
          </div>
        )}
      </div>
    </div>
  );
}
