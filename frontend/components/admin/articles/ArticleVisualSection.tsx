"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ArticleVisualSection({
  title,
  axes,
  mediaRectangleId,
  mediaSquareId,
  previewRectUrl,
  onChange,
}: {
  title: string;
  axes: any[];
  mediaRectangleId: string | null;
  mediaSquareId: string | null;
  previewRectUrl: string | null;

  onChange: (v: {
    rectangleId: string | null;
    squareId: string | null;
    previewUrl: string | null;
  }) => void;
}) {
  /* ------------------------------------------------------------------
     TABS : upload | existing | ai
  ------------------------------------------------------------------ */
  type Mode = "upload" | "existing" | "ia";
  const [mode, setMode] = useState<Mode>("upload");

  function reset() {
    onChange({
      rectangleId: null,
      squareId: null,
      previewUrl: null,
    });
  }

  function switchMode(m: Mode) {
    setMode(m);
    reset();
  }

  /* ------------------------------------------------------------------
     MODE 1 : UPLOAD LOCAL
  ------------------------------------------------------------------ */
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  function onSelectFile(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadPreview(URL.createObjectURL(f));
  }

  async function uploadFile() {
    if (!file) return alert("Sélectionnez un fichier");

    setUploading(true);

    const arrayBuf = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");

    const res = await api.post("/visuals/article/upload", {
      id_article: "_temp_", // ⚠️ remplacé dans la page Create via override
      title: title || "article",
      base64_image: base64,
    });

    if (res.status !== "ok") {
      alert("Erreur upload visuel article");
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

  /* ------------------------------------------------------------------
     MODE 2 : EXISTING (VISUEL AXE OU SOCIÉTÉ)
  ------------------------------------------------------------------ */
  const [selectingExisting, setSelectingExisting] = useState(false);

  async function applyExisting(type: "axe" | "company") {
    if (!axes?.length && type === "axe") {
      alert("Aucun axe sélectionné");
      return;
    }

    setSelectingExisting(true);

    let urlRect = null;
    let urlSquare = null;

    if (type === "axe") {
      const axeId = axes[0].id_axe;
      const res = await api.get(`/axes/${axeId}`);
      urlRect = res?.axe?.MEDIA_RECTANGLE_URL || null;
      urlSquare = res?.axe?.MEDIA_SQUARE_URL || null;
    }

    if (type === "company") {
      alert("Sélection d’une société → à implémenter page parent");
      setSelectingExisting(false);
      return;
    }

    if (!urlRect || !urlSquare) {
      alert("Visuel indisponible");
      setSelectingExisting(false);
      return;
    }

    const res = await api.post("/visuals/article/apply-existing", {
      id_article: "_temp_",
      rectangle_url: urlRect,
      square_url: urlSquare,
    });

    if (res.status !== "ok") {
      alert("Erreur import visuel existant");
      setSelectingExisting(false);
      return;
    }

    onChange({
      rectangleId: res.ids.rectangle,
      squareId: res.ids.square,
      previewUrl: res.urls.rectangle,
    });

    setSelectingExisting(false);
  }

  /* ------------------------------------------------------------------
     MODE 3 : IA (UNIQUEMENT AXES)
  ------------------------------------------------------------------ */
  const [generatingAI, setGeneratingAI] = useState(false);

  async function generateAI() {
    if (!title?.trim()) return alert("Titre requis");
    if (!axes?.length) return alert("Un axe est requis pour générer un visuel IA");

    setGeneratingAI(true);

    const axeId = axes[0].id_axe;

    const axeData = await api.get(`/axes/${axeId}`);
    const inspirationUrl = axeData?.axe?.MEDIA_SQUARE_URL;

    const res = await api.post("/visuals/article/generate-ai", {
      id_article: "_temp_",
      title,
      resume: "",
      axe_visual_square_url: inspirationUrl,
    });

    if (res.status !== "ok") {
      alert("Erreur IA");
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

  /* ------------------------------------------------------------------
     UI
  ------------------------------------------------------------------ */

  return (
    <div className="p-4 border rounded bg-white space-y-4">

      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuel de l’article
      </h2>

      {/* TABS */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => switchMode("upload")}
          className={mode === "upload" ? "font-semibold border-b-2 border-ratecard-blue" : ""}
        >
          Upload local
        </button>

        <button
          onClick={() => switchMode("existing")}
          className={mode === "existing" ? "font-semibold border-b-2 border-ratecard-blue" : ""}
        >
          Visuel existant
        </button>

        <button
          onClick={() => switchMode("ia")}
          className={mode === "ia" ? "font-semibold border-b-2 border-ratecard-blue" : ""}
        >
          Génération IA
        </button>
      </div>

      {/* -------------------------- */}
      {/* MODE 1 — UPLOAD */}
      {/* -------------------------- */}
      {mode === "upload" && (
        <div className="space-y-3">
          <input type="file" accept="image/*" onChange={onSelectFile} />

          {uploadPreview && (
            <img src={uploadPreview} className="w-60 rounded border" />
          )}

          <button
            disabled={uploading || !file}
            onClick={uploadFile}
            className="px-4 py-2 bg-ratecard-blue text-white rounded"
          >
            {uploading ? "Upload…" : "Uploader"}
          </button>
        </div>
      )}

      {/* -------------------------- */}
      {/* MODE 2 — EXISTING */}
      {/* -------------------------- */}
      {mode === "existing" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Vous pouvez appliquer le visuel d’un axe ou d’une société.
          </p>

          <button
            onClick={() => applyExisting("axe")}
            disabled={!axes?.length || selectingExisting}
            className="px-4 py-2 bg-ratecard-blue text-white rounded"
          >
            {selectingExisting ? "Import…" : "Visuel de l’axe"}
          </button>

          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
          >
            Visuel de la société (bientôt)
          </button>
        </div>
      )}

      {/* -------------------------- */}
      {/* MODE 3 — IA */}
      {/* -------------------------- */}
      {mode === "ia" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Le visuel IA est généré uniquement à partir des axes choisis.
          </p>

          <button
            onClick={generateAI}
            disabled={!axes?.length || generatingAI}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            {generatingAI ? "Génération…" : "Générer via IA"}
          </button>
        </div>
      )}

      {/* PREVIEW FINALE */}
      {previewRectUrl && (
        <div className="mt-4">
          <p className="text-xs text-gray-500">Aperçu final :</p>
          <img src={previewRectUrl} className="w-80 border rounded bg-white" />
        </div>
      )}
    </div>
  );
}
