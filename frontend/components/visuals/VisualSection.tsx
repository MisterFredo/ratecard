"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  entityId: string;

  // 🔑 URL calculée par le parent (ou null)
  rectUrl: string | null;

  // 🔑 signal simple : “le visuel a changé”
  onUpdated: () => void;
};

export default function VisualSection({
  entityId,
  rectUrl,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     Convert file → base64 (sans header)
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     UPLOAD — LOGO SOCIÉTÉ
  --------------------------------------------------------- */
  async function upload(file: File) {
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/company/upload", {
        id_company: entityId,
        base64_image: base64,
      });

      if (res.status !== "ok") {
        throw new Error("Upload échoué");
      }

      // ✅ on ne manipule PLUS d’URL ici
      onUpdated();
    } catch (e) {
      console.error(e);
      alert("❌ Erreur upload visuel");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-semibold text-ratecard-blue">
        Logo de la société
      </h2>

      <p className="text-sm text-gray-600">
        Logo affiché sans déformation.
        <br />
        Les proportions sont <strong>strictement respectées</strong>.
      </p>

      {loading && (
        <p className="text-sm text-gray-500">Traitement en cours…</p>
      )}

      {/* PREVIEW LOGO */}
      <div className="space-y-2">
        {rectUrl ? (
          <div className="max-w-xl border rounded bg-white p-8 flex items-center justify-center">
            <img
              src={rectUrl}
              alt="Logo société"
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
          className="mt-2"
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
