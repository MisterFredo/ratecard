"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function AdminHome() {

  const [file, setFile] = useState<File | null>(null);
  const [sourceId, setSourceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [result, setResult] = useState("");

  // ============================================================
  // PREVIEW FILE
  // ============================================================

  async function handleFileChange(f: File | null) {

    setFile(f);
    setPreviewCount(null);
    setResult("");

    if (!f) return;

    const text = await f.text();

    const matches = text.match(/TITLE\s*:/g);

    if (matches) {
      setPreviewCount(matches.length);
    } else {
      setPreviewCount(0);
    }

  }

  // ============================================================
  // IMPORT
  // ============================================================

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
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResult(`Import réussi : ${res.imported} contenus`);

    } catch (e) {

      console.error(e);
      alert("Erreur import");

    }

    setLoading(false);

  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-10">

      {/* DASHBOARD */}

      <div>
        <h1 className="text-2xl font-semibold mb-4">
          Dashboard Ratecard
        </h1>

        <p>
          Bienvenue dans l’espace admin. Choisissez une section dans le menu.
        </p>
      </div>

      {/* IMPORT RAW TEMPORAIRE */}

      <div className="border rounded-lg p-6 space-y-6 bg-gray-50">

        <div>
          <h2 className="text-xl font-semibold">
            Import RAW Content (temporaire)
          </h2>

          <p className="text-sm text-gray-500">
            Import ponctuel de fichiers structurés dans RATECARD_CONTENT_RAW
          </p>
        </div>

        {/* SOURCE */}

        <div className="space-y-2">

          <label className="text-sm font-medium">
            ID_SOURCE
          </label>

          <input
            type="text"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            placeholder="ex : JDN"
            className="border rounded px-3 py-2 w-full"
          />

        </div>

        {/* FILE */}

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Fichier TXT
          </label>

          <input
            type="file"
            accept=".txt"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] || null)
            }
          />

        </div>

        {/* PREVIEW */}

        {previewCount !== null && (

          <div className="text-sm text-gray-600">

            {previewCount === 0 && (
              <span className="text-red-600">
                Aucun bloc TITLE détecté
              </span>
            )}

            {previewCount > 0 && (
              <span>
                {previewCount} contenus détectés dans le fichier
              </span>
            )}

          </div>

        )}

        {/* BUTTON */}

        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >

          {loading ? "Import en cours..." : "Importer"}

        </button>

        {/* RESULT */}

        {result && (
          <div className="text-green-600 font-medium">
            {result}
          </div>
        )}

      </div>

    </div>
  );
}
