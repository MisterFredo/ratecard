"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type VisualState = {
  rectangleId: string | null;
  squareId: string | null;
  previewUrl: string | null;
};

export default function ArticleVisualSection({
  articleId = null,        // null en mode création, ID réel en édition
  title,
  axes,
  onChange,
  initialRectangleUrl,
  initialSquareUrl,
}: {
  articleId?: string | null;
  title: string;
  axes: { id_axe: string; label: string }[];
  onChange: (v: VisualState) => void;

  initialRectangleUrl?: string | null;
  initialSquareUrl?: string | null;
}) {
  /* ---------------------------------------------------------
     MODE D'ACTION
  --------------------------------------------------------- */
  type Mode = "upload" | "existing" | "ai";
  const [mode, setMode] = useState<Mode>("upload");

  function reset() {
    onChange({ rectangleId: null, squareId: null, previewUrl: null });
  }

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  /* ---------------------------------------------------------
     UPLOAD LOCAL
  --------------------------------------------------------- */
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function selectFile(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLocalPreview(URL.createObjectURL(f));
  }

  async function uploadLocal() {
    if (!file) return alert("Sélectionnez un fichier");
    if (!title?.trim()) return alert("Titre requis");

    setUploading(true);

    const arrayBuf = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");

    const id = articleId || "_temp_";

    const res = await api.post("/visuals/article/upload", {
      id_article: id,
      title,
      base64_image: base64,
    });

    if (res.status !== "ok") {
      alert("Erreur upload article");
      setUploading(false);
      return;
    }

    onChange({
      rectangleId: res.ids.rectangle,
      squareId: res.ids.square,
      previewUrl: res.urls.rectangle,
    });

    setUploading(false);
  }

  /* ---------------------------------------------------------
     EXISTING (AXE) — strict
  --------------------------------------------------------- */
  const [importingExisting, setImportingExisting] = useState(false);

  async function applyFromAxe() {
    if (!axes.length) return alert("Sélectionnez au moins un axe");

    const axeId = axes[0].id_axe; // règle validée : 1 seul inspire

    setImportingExisting(true);

    const axeRes = await api.get(`/axes/${axeId}`);

    const squareUrl = axeRes?.axe?.MEDIA_SQUARE_URL;
    const rectUrl = axeRes?.axe?.MEDIA_RECTANGLE_URL;

    if (!squareUrl || !rectUrl) {
      alert("Cet axe n’a pas de visuel complet (carre + rectangle)");
      setImportingExisting(false);
      return;
    }

    const id = articleId || "_temp_";

    const res = await api.post("/visuals/article/apply-existing", {
      id_article: id,
      square_url: squareUrl,
      rectangle_url: rectUrl,
    });

    if (res.status !== "ok") {
      alert("Erreur import visuel axe");
      setImportingExisting(false);
      return;
    }

    onChange({
      rectangleId: res.ids.rectangle,
      squareId: res.ids.square,
      previewUrl: res.urls.rectangle,
    });

    setImportingExisting(false);
  }

  /* ---------------------------------------------------------
     IA — uniquement axes (strict)
  --------------------------------------------------------- */
  const [generatingAI, setGeneratingAI] = useState(false);

  async function generateAI() {
    if (!title?.trim()) return alert("Titre requis");
    if (!axes.length)
      return alert("Un axe est requis pour générer un visuel IA");

    const axeId = axes[0].id_axe;
    const axeRes = await api.get(`/axes/${axeId}`);

    const squareInspiration = axeRes?.axe?.MEDIA_SQUARE_URL;
    if (!squareInspiration) {
      alert("Aucun visuel carré inspirant pour cet axe");
      return;
    }

    setGeneratingAI(true);

    const id = articleId || "_temp_";

    const res = await api.post("/visuals/article/generate-ai", {
      id_article: id,
      title,
      excerpt: "",
      axe_visual_square_url: squareInspiration,
    });

    if (res.status !== "ok") {
      alert("Erreur génération IA");
      setGeneratingAI(false);
      return;
    }

    onChange({
      rectangleId: res.ids.rectangle,
      squareId: res.ids.square,
      previewUrl: res.urls.rectangle,
    });

    setGeneratingAI(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="p-4 border rounded bg-white space-y-4">

      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuel de l’article
      </h2>

      {/* MODES */}
      <div className="flex gap-4 border-b pb-2">
        {[
          ["upload", "Upload"],
          ["existing", "Visuel existant"],
          ["ai", "Génération IA"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => switchMode(val as Mode)}
            className={
              mode === val
                ? "font-semibold border-b-2 border-ratecard-blue"
                : "text-gray-500"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------------------------------- */}
      {/* UPLOAD */}
      {/* ---------------------------------- */}
      {mode === "upload" && (
        <div className="space-y-3">
          <input type="file" accept="image/*" onChange={selectFile} />

          {localPreview && (
            <img
              src={localPreview}
              className="w-60 border rounded bg-white"
            />
          )}

          <button
            disabled={!file || uploading}
            onClick={uploadLocal}
            className="px-4 py-2 bg-ratecard-blue text-white rounded"
          >
            {uploading ? "Upload…" : "Uploader"}
          </button>
        </div>
      )}

      {/* ---------------------------------- */}
      {/* EXISTING (AXE) */}
      {/* ---------------------------------- */}
      {mode === "existing" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Le visuel sera importé depuis le premier axe sélectionné.
          </p>

          <button
            disabled={!axes.length || importingExisting}
            onClick={applyFromAxe}
            className="px-4 py-2 bg-ratecard-blue text-white rounded"
          >
            {importingExisting ? "Import…" : "Visuel de l’axe"}
          </button>
        </div>
      )}

      {/* ---------------------------------- */}
      {/* IA */}
      {/* ---------------------------------- */}
      {mode === "ai" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Le visuel IA s’appuie uniquement sur le 1er axe.
          </p>

          <button
            disabled={!axes.length || generatingAI}
            onClick={generateAI}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            {generatingAI ? "Génération…" : "Générer via IA"}
          </button>
        </div>
      )}

      {/* PREVIEW */}
      {(initialRectangleUrl || localPreview) && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-1">Aperçu :</p>
          <img
            src={localPreview || initialRectangleUrl!}
            className="w-80 border rounded bg-white"
          />
        </div>
      )}
    </div>
  );
}

