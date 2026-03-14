"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type SourceItem = {
  id_source: string;
  label: string;
};

export default function StockImportPanel({
  sources,
  onImported,
}: {
  sources: SourceItem[];
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [urlsText, setUrlsText] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileImport() {
    if (!file) return alert("Choisissez un fichier");
    if (!sourceId) return alert("Choisissez une source");

    setLoading(true);
    setMessage("");

    try {
      const text = await file.text();

      const res = await api.post("/content/raw/import", {
        id_source: sourceId,
        text,
      });

      setMessage(`✅ ${res.imported} contenu(s) importé(s)`);
      onImported();
    } catch (e) {
      console.error(e);
      setMessage("❌ Erreur import fichier");
    }

    setLoading(false);
  }

  async function handleUrlImport() {
    if (!urlsText.trim()) return alert("URLs manquantes");
    if (!sourceId) return alert("Choisissez une source");

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/content/raw/import-urls", {
        id_source: sourceId,
        urls_text: urlsText,
      });

      setMessage(`✅ ${res.message}`);
      setUrlsText("");
      onImported();
    } catch (e) {
      console.error(e);
      setMessage("❌ Erreur import URLs");
    }

    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-6 bg-gray-50 space-y-6">

      <h2 className="text-lg font-semibold">Importer des contenus</h2>

      <div className="flex gap-4 items-center">
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Source</option>
          {sources.map((s) => (
            <option key={s.id_source} value={s.id_source}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* FILE IMPORT */}
      <div className="flex gap-4 items-center">
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleFileImport}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Importer fichier
        </button>
      </div>

      {/* URL IMPORT */}
      <div className="space-y-2">
        <textarea
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          placeholder="Une URL par ligne"
          rows={4}
          className="w-full border rounded p-2 text-sm"
        />
        <button
          onClick={handleUrlImport}
          disabled={loading}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          Importer URLs
        </button>
      </div>

      {message && (
        <div className="text-sm font-medium">
          {message}
        </div>
      )}

    </div>
  );
}
