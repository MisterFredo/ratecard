"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Source = {
  source_id: string;
  name: string;
};

export default function ContentImportPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [archiveUrl, setArchiveUrl] = useState("");
  const [maxArticles, setMaxArticles] = useState(50);
  const [dateMin, setDateMin] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // LOAD SOURCES
  // ==========================================================

  useEffect(() => {
    async function loadSources() {
      try {
        const res = await api.get("/source/list");
        const list = res.sources || [];

        setSources(list);

        if (list.length) {
          setSelectedSource(list[0].source_id);
        }
      } catch (e) {
        console.error(e);
        alert("Impossible de charger les sources");
      }
    }

    loadSources();
  }, []);

  // ==========================================================
  // IMPORT ARCHIVE
  // ==========================================================

  async function handleImport() {
    if (!selectedSource) {
      alert("Sélectionnez une source");
      return;
    }

    if (!archiveUrl.trim()) {
      alert("Archive URL obligatoire");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/content/raw/import-archive", {
        source_id: selectedSource,
        archive_url: archiveUrl,
        max_articles: maxArticles,
        date_min: dateMin || null,
      });

      setResult(res.result);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l’import");
    }

    setLoading(false);
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-8 max-w-2xl">

      <div>
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Import d’archive
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Import automatique des articles d’une archive (Substack – MVP)
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border space-y-6">

        {/* SOURCE SELECTOR */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Source
          </label>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="border rounded p-2 w-full text-sm"
          >
            <option value="">Sélectionner une source</option>

            {sources.map((s) => (
              <option
                key={s.source_id}
                value={s.source_id}
              >
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* ARCHIVE URL */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Archive URL
          </label>

          <input
            type="text"
            value={archiveUrl}
            onChange={(e) => setArchiveUrl(e.target.value)}
            className="border rounded p-2 w-full text-sm"
            placeholder="https://www.retailmediabreakfastclub.com/archive"
          />
        </div>

        {/* DATE MIN */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Date minimale (optionnel)
          </label>

          <input
            type="date"
            value={dateMin}
            onChange={(e) => setDateMin(e.target.value)}
            className="border rounded p-2 w-full text-sm"
          />
        </div>

        {/* MAX ARTICLES */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Nombre maximum d’articles
          </label>

          <input
            type="number"
            value={maxArticles}
            onChange={(e) => setMaxArticles(Number(e.target.value))}
            className="border rounded p-2 w-full text-sm"
            min={1}
            max={200}
          />
        </div>

        {/* BUTTON */}
        <div className="pt-2">
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded text-sm"
          >
            {loading ? "Import en cours..." : "Importer"}
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div className="bg-gray-50 p-4 rounded border text-sm space-y-1">
            <div>
              <strong>Total trouvés :</strong> {result.total_found}
            </div>
            <div>
              <strong>Insérés :</strong> {result.inserted}
            </div>
            <div>
              <strong>Ignorés (déjà existants) :</strong> {result.skipped_existing}
            </div>
            <div>
              <strong>Arrêt par date :</strong>{" "}
              {result.stopped_by_date ? "Oui" : "Non"}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
