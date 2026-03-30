"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  entityId: string;
  rectUrl: string | null;
  onUpdated: () => void;
};

export default function VisualSectionSource({
  entityId,
  rectUrl,
  onUpdated,
}: Props) {

  const [loading, setLoading] = useState(false);

  function fileToBase64(file: File): Promise<string> {
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

  async function upload(file: File) {

    setLoading(true);

    try {

      const base64 = await fileToBase64(file);

      // ✅ EXACTEMENT comme company (pas de logique dynamique)
      const res = await api.post("/visuals/source/upload", {
        id_source: entityId,
        base64_image: base64,
      });

      if (res.status !== "ok") {
        throw new Error("Upload échoué");
      }

      onUpdated();

    } catch (e) {

      console.error(e);
      alert("❌ Erreur upload visuel");

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="p-4 border rounded bg-white space-y-4">

      <h2 className="text-xl font-semibold text-ratecard-blue">
        Logo de la source
      </h2>

      <p className="text-sm text-gray-600">
        Logo affiché sans déformation.
      </p>

      {loading && (
        <p className="text-sm text-gray-500">
          Traitement en cours…
        </p>
      )}

      <div className="space-y-2">

        {rectUrl ? (
          <div className="max-w-xl border rounded bg-white p-8 flex items-center justify-center">
            <img
              src={rectUrl}
              alt="Logo"
              className="max-h-40 w-auto object-contain"
            />
          </div>
        ) : (
          <div className="max-w-xl h-40 bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-500">
            Aucun logo défini
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              upload(e.target.files[0]);
            }
          }}
        />

      </div>
    </div>
  );
}
