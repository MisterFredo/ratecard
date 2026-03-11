"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function AdminHome() {

  const [file, setFile] = useState<File | null>(null);
  const [sourceId, setSourceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [result, setResult] = useState("");

  async function handleFileChange(f: File | null) {

    setFile(f);
    setPreviewCount(null);
    setResult("");

    if (!f) return;

    const text = await f.text();

    const matches = text.match(/TITLE\s*:/g);

    setPreviewCount(matches ? matches.length : 0);
  }

  async function handleImport() {

    if (!file) {
      alert("Choisissez un fichier");
      return;
    }

    if (!sourceId) {
      alert("Indiquez un ID_SOURCE");
      return;
    }

    const form = new FormData();

    form.append("file", file);
    form.append("id_source", sourceId);

    setLoading(true);
    setResult("");

    try {

      const res = await api.post(
        "/content/raw/import",
        form
      );

      setResult(`Import réussi : ${res.imported} contenus`);

    } catch (e: any) {

      console.error(e);
      setResult("Erreur import");

    }

    setLoading(false);
  }

  return (

    <div className="space-y-10">

      <div>
        <h1 className="text-2xl font-semibold mb-4">
          Dashboard Ratecard
        </h1>

        <p>
          Bienvenue dans l’espace admin. Choisissez une section dans le menu.
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-6 bg-gray-50">

        <h2 className="text-xl font-semibold">
          Import RAW Content (temporaire)
        </h2>

        <div className="space-y-2">
          <label>ID_SOURCE</label>

          <input
            type="text"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="JDN"
          />
        </div>

        <div className="space-y-2">
          <label>Fichier TXT</label>

          <input
            type="file"
            accept=".txt"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] || null)
            }
          />
        </div>

        {previewCount !== null && (
          <div className="text-sm text-gray-600">
            {previewCount} contenus détectés
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Import..." : "Importer"}
        </button>

        {result && (
          <div className="text-sm font-medium">
            {result}
          </div>
        )}

      </div>

    </div>
  );
}
