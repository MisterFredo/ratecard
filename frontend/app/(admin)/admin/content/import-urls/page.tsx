"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Source = {
  ID_SOURCE: string;
  NAME: string;
};

export default function ImportUrlsPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [urlsText, setUrlsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ============================================================
  // LOAD SOURCES
  // ============================================================
  useEffect(() => {
    async function loadSources() {
      try {
        const res = await api.get("/content/source/list");

        // Compatible wrapper custom ou axios natif
        const data = res?.data ?? res;

        console.log("SOURCES RESPONSE:", data);

        setSources(data.sources || []);
      } catch (e) {
        console.error("Erreur load sources", e);
      }
    }

    loadSources();
  }, []);

  // ============================================================
  // HANDLE IMPORT
  // ============================================================
  async function handleImport() {
    if (!urlsText.trim()) {
      alert("URLs manquantes");
      return;
    }

    if (!selectedSource) {
      alert("Source obligatoire");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/content/raw/import-urls", {
        urls_text: urlsText,
        id_source: selectedSource,
      });

      const data = res?.data ?? res;

      console.log("IMPORT RESPONSE:", data);

      setResult(data);
    } catch (e: any) {
      console.error("Erreur import:", e);
      alert("Erreur import");
    }

    setLoading(false);
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">
        Import URLs (RAW)
      </h1>

      {/* SOURCE SELECTOR */}
      <div>
        <label className="block text-sm mb-1">
          Source
        </label>

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Sélectionner une source --</option>
          {sources.map((s) => (
            <option key={s.ID_SOURCE} value={s.ID_SOURCE}>
              {s.NAME}
            </option>
          ))}
        </select>
      </div>

      {/* URL TEXTAREA */}
      <div>
        <label className="block text-sm mb-1">
          URLs (une par ligne)
        </label>

        <textarea
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          rows={10}
          className="w-full border rounded px-3 py-2 font-mono text-sm"
          placeholder={`https://...\nhttps://...\nhttps://...`}
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={handleImport}
        disabled={loading}
        className="px-4 py-2 bg-ratecard-blue text-white rounded hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Import en cours..." : "Importer"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="bg-white border rounded p-4 text-sm">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
