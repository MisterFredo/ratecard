"use client";

import { useState } from "react";
import ImageUploadField from "@/components/visuals/ImageUploadField";

export default function CompanyVisualSection({
  id_company,
  squareUrl,
  rectUrl,
  onSquareChange,
  onRectChange,
}: {
  id_company: string;
  squareUrl: string | null;
  rectUrl: string | null;
  onSquareChange: (u: string | null) => void;
  onRectChange: (u: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showApplyExisting, setShowApplyExisting] = useState(false);

  const [existingSquare, setExistingSquare] = useState("");
  const [existingRect, setExistingRect] = useState("");

  // ----------------------------------------------------
  // UPLOAD MANUEL → /api/visuals/company/upload
  // ----------------------------------------------------
  async function uploadManual(base64: string) {
    setLoading(true);

    const res = await fetch("/api/visuals/company/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_company,
        base64_image: base64,
      }),
    }).then((r) => r.json());

    setLoading(false);

    if (res.status !== "ok") {
      alert("❌ Erreur upload société");
      return;
    }

    onSquareChange(res.urls.square);
    onRectChange(res.urls.rectangle);
    setShowUpload(false);
  }

  // ----------------------------------------------------
  // APPLY EXISTING → /api/visuals/company/apply-existing
  // ----------------------------------------------------
  async function applyExisting() {
    if (!existingSquare) return alert("URL carré obligatoire");

    setLoading(true);

    const res = await fetch("/api/visuals/company/apply-existing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_company,
        square_url: existingSquare,
        rectangle_url: existingRect || existingSquare,
      }),
    }).then((r) => r.json());

    setLoading(false);

    if (res.status !== "ok") {
      alert("❌ Erreur apply-existing société");
      return;
    }

    onSquareChange(res.urls.square);
    onRectChange(res.urls.rectangle);
    setShowApplyExisting(false);
  }

  // ----------------------------------------------------
  // RESET → /api/visuals/company/reset
  // ----------------------------------------------------
  async function resetVisuals() {
    if (!confirm("Supprimer les visuels de cette société ?")) return;

    setLoading(true);

    const res = await fetch("/api/visuals/company/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_company }),
    }).then((r) => r.json());

    setLoading(false);

    if (res.status !== "ok") {
      alert("❌ Erreur reset société");
      return;
    }

    onSquareChange(null);
    onRectChange(null);
  }

  return (
    <div className="p-4 border rounded bg-white space-y-6">

      <h2 className="text-lg font-semibold text-ratecard-blue">
        Visuels de la société
      </h2>

      {/* PREVIEWS */}
      <div className="flex gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Carré</p>
          {squareUrl ? (
            <img
              src={squareUrl}
              className="w-24 h-24 object-cover rounded border shadow bg-white"
            />
          ) : (
            <div className="w-24 h-24 border rounded bg-gray-100 text-xs text-gray-400 flex items-center justify-center">
              Aucun
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Rectangle</p>
          {rectUrl ? (
            <img
              src={rectUrl}
              className="w-48 h-auto rounded border shadow bg-white"
            />
          ) : (
            <div className="w-48 h-24 border rounded bg-gray-100 text-xs text-gray-400 flex items-center justify-center">
              Aucun
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowUpload(true);
            setShowApplyExisting(false);
          }}
          className="px-3 py-2 bg-ratecard-green text-white rounded"
        >
          Upload manuel
        </button>

        <button
          onClick={() => {
            setShowApplyExisting(true);
            setShowUpload(false);
          }}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Appliquer un visuel existant
        </button>

        <button
          onClick={resetVisuals}
          className="px-3 py-2 bg-red-600 text-white rounded"
        >
          Reset
        </button>
      </div>

      {/* UPLOAD MANUEL */}
      {showUpload && (
        <div className="border rounded p-4 bg-gray-50">
          <ImageUploadField
            label="Uploader une image"
            onUpload={uploadManual}
          />
        </div>
      )}

      {/* APPLY EXISTING */}
      {showApplyExisting && (
        <div className="border rounded p-4 bg-gray-50 space-y-3">
          <p className="font-medium text-sm">Appliquer depuis URLs existantes</p>

          <input
            placeholder="URL carré obligatoire"
            value={existingSquare}
            onChange={(e) => setExistingSquare(e.target.value)}
            className="border p-2 rounded w-full text-sm"
          />

          <input
            placeholder="URL rectangle (optionnel)"
            value={existingRect}
            onChange={(e) => setExistingRect(e.target.value)}
            className="border p-2 rounded w-full text-sm"
          />

          <button
            onClick={applyExisting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Appliquer
          </button>
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Chargement…</p>}
    </div>
  );
}
