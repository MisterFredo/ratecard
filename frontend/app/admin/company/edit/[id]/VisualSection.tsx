"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function VisualSection({
  id,
  squareUrl,
  rectUrl,
  onUpdated,
}: {
  id: string;
  squareUrl: string | null;
  rectUrl: string | null;
  onUpdated: (urls: { square: string | null; rectangle: string | null }) => void;
}) {
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------
  //  Convert file → base64
  // -------------------------------------------------------------------
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result?.toString() || "";
        resolve(result.replace(/^data:image\/\w+;base64,/, ""));
      };
      reader.readAsDataURL(file);
    });
  }

  // -------------------------------------------------------------------
  // UPLOAD manually
  // -------------------------------------------------------------------
  async function uploadManual(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/company/upload", {
        id_company: id,
        base64_image: base64,
      });

      if (res.status !== "ok") throw new Error("Erreur upload");

      onUpdated({
        square: res.urls.square,
        rectangle: res.urls.rectangle,
      });

      alert("Visuel mis à jour !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l’upload");
    }

    setLoading(false);
  }

  // -------------------------------------------------------------------
  // APPLY existing visual (from axe/company/article)
  // -------------------------------------------------------------------
  async function applyExisting(square_url: string, rectangle_url: string) {
    setLoading(true);

    try {
      const res = await api.post("/visuals/company/apply-existing", {
        id_company: id,
        square_url,
        rectangle_url,
      });

      if (res.status !== "ok") throw new Error("Erreur apply-existing");

      onUpdated({
        square: res.urls.square,
        rectangle: res.urls.rectangle,
      });

      alert("Visuel appliqué !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la copie du visuel");
    }

    setLoading(false);
  }

  // -------------------------------------------------------------------
  // RESET
  // -------------------------------------------------------------------
  async function resetVisual() {
    if (!confirm("Supprimer les visuels de cette société ?")) return;

    setLoading(true);

    try {
      const res = await api.post("/visuals/company/reset", {
        id_company: id,
      });

      if (res.status !== "ok") throw new Error("Erreur reset");

      onUpdated({ square: null, rectangle: null });

      alert("Visuels supprimés !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors du reset");
    }

    setLoading(false);
  }

  // -------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------
  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuels officiels
      </h2>

      {loading && <p className="text-gray-500 text-sm">Traitement…</p>}

      {/* PREVIEWS */}
      <div className="flex gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Carré</p>
          {squareUrl ? (
            <img
              src={squareUrl}
              className="w-24 h-24 object-cover border rounded shadow bg-white"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-500">
              Aucun
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Rectangle</p>
          {rectUrl ? (
            <img
              src={rectUrl}
              className="w-48 h-auto border rounded shadow bg-white"
            />
          ) : (
            <div className="w-48 h-24 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-500">
              Aucun
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3">

        {/* UPLOAD */}
        <label className="block">
          <span className="text-sm font-medium">Uploader un visuel</span>
          <input
            type="file"
            accept="image/*"
            className="mt-1"
            onChange={uploadManual}
          />
        </label>

        {/* APPLY EXISTING */}
        <button
          onClick={() =>
            applyExisting(
              "/PLACEHOLDER_SQUARE.jpg", // ← dans EditCompany, tu passeras les valeurs réelles
              "/PLACEHOLDER_RECT.jpg"
            )
          }
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Appliquer depuis un visuel existant
        </button>

        {/* RESET */}
        <button
          onClick={resetVisual}
          className="px-3 py-2 bg-red-600 text-white rounded text-sm"
        >
          Réinitialiser les visuels
        </button>
      </div>
    </div>
  );
}
