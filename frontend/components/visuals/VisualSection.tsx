"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function VisualSection({
  entityType,     // "company" | "person" | "axe" | "article"
  entityId,       // ID de l'entité
  squareUrl,
  rectUrl,
  onUpdated,
}: {
  entityType: "company" | "person" | "axe" | "article";
  entityId: string;
  squareUrl: string | null;
  rectUrl: string | null;
  onUpdated: (urls: { square: string | null; rectangle: string | null }) => void;
}) {
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // Convert file → base64
  // ---------------------------------------------------------
  async function toBase64(file: File): Promise<string> {
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

  // ---------------------------------------------------------
  // UPLOAD
  // ---------------------------------------------------------
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const base64 = await toBase64(file);

      const res = await api.post(`/visuals/${entityType}/upload`, {
        [`id_${entityType}`]: entityId,  // id_company, id_person, id_axe, id_article
        base64_image: base64,
      });

      if (res.status !== "ok") throw new Error("Upload failed");

      onUpdated({
        square: res.urls.square,
        rectangle: res.urls.rectangle,
      });

      alert("Visuels mis à jour !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur upload");
    }

    setLoading(false);
  }

  // ---------------------------------------------------------
  // APPLY EXISTING
  // ---------------------------------------------------------
  async function applyExisting(square_url: string, rectangle_url: string) {
    setLoading(true);
    try {
      const res = await api.post(`/visuals/${entityType}/apply-existing`, {
        [`id_${entityType}`]: entityId,
        square_url,
        rectangle_url,
      });

      if (res.status !== "ok") throw new Error("Apply failed");

      onUpdated({
        square: res.urls.square,
        rectangle: res.urls.rectangle,
      });

      alert("Visuel appliqué !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur apply-existing");
    }
    setLoading(false);
  }

  // ---------------------------------------------------------
  // RESET
  // ---------------------------------------------------------
  async function resetVisual() {
    if (!confirm("Supprimer les visuels ?")) return;

    setLoading(true);
    try {
      const res = await api.post(`/visuals/${entityType}/reset`, {
        [`id_${entityType}`]: entityId,
      });

      if (res.status !== "ok") throw new Error("Reset failed");

      onUpdated({ square: null, rectangle: null });
      alert("Visuels réinitialisés !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur reset");
    }
    setLoading(false);
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuels (carré + rectangle)
      </h2>

      {loading && <p className="text-gray-500">Traitement…</p>}

      {/* PREVIEWS */}
      <div className="flex gap-6">
        {/* SQUARE */}
        <div>
          <p className="text-sm text-gray-500">Carré</p>
          {squareUrl ? (
            <img src={squareUrl} className="w-24 h-24 object-cover border rounded" />
          ) : (
            <div className="w-24 h-24 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-500">
              Aucun
            </div>
          )}
        </div>

        {/* RECTANGLE */}
        <div>
          <p className="text-sm text-gray-500">Rectangle</p>
          {rectUrl ? (
            <img src={rectUrl} className="w-48 border rounded" />
          ) : (
            <div className="w-48 h-24 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-500">
              Aucun
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Uploader un visuel</span>
          <input type="file" accept="image/*" onChange={upload} className="mt-1" />
        </label>

        {/* Apply existing (activé via parent) */}
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
          onClick={() => alert("À connecter dans EditPerson/EditAxe/EditCompany")}
        >
          Appliquer un visuel existant
        </button>

        <button
          className="px-3 py-2 bg-red-600 text-white rounded text-sm"
          onClick={resetVisual}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
