"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  entityId: string;

  // preview URL
  rectUrl: string | null;

  // callback reload
  onUpdated: () => void;

  // 🔥 NEW — rend le composant générique
  endpoint: "company" | "source";
};

export default function VisualSection({
  entityId,
  rectUrl,
  onUpdated,
  endpoint,
}: Props) {

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     Convert file → base64
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
     UPLOAD — dynamique
  --------------------------------------------------------- */
  async function upload(file: File) {

    setLoading(true);

    try {

      const base64 = await fileToBase64(file);

      // 🔥 clé dynamique
      const payload =
        endpoint === "company"
          ? { id_company: entityId }
          : { id_source: entityId };

      const res = await api.post(
        `/visuals/${endpoint}/upload`,
        {
          ...payload,
          base64_image: base64,
        }
      );

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

  /* ---------------------------------------------------------
     LABEL dynamique
  --------------------------------------------------------- */
  const label =
    endpoint === "company"
      ? "Logo de la société"
      : "Logo de la source";

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="p-4 border rounded bg-white space-y-4">

      <h2 className="text-xl font-semibold text-ratecard-blue">
        {label}
      </h2>

      <p className="text-sm text-gray-600">
        Logo affiché sans déformation.
        <br />
        Les proportions sont <strong>strictement respectées</strong>.
      </p>

      {loading && (
        <p className="text-sm text-gray-500">
          Traitement en cours…
        </p>
      )}

      {/* PREVIEW */}
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
