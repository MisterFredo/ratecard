"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import ArticleImageUploader from "./ArticleImageUploader";

export default function ArticleVisualSelector({
  articleId,
  title,
  axes,
  companies,
  onChange,
}: {
  articleId: string;
  title: string;
  axes: Array<{
    id_axe: string;
    label: string;
    square_url: string | null;
  }>;
  companies: Array<{
    id_company: string;
    name: string;
    square_url: string | null;
  }>;
  onChange: (urls: { rectangle_url: string; square_url: string }) => void;
}) {
  const [mode, setMode] = useState<"axis" | "company" | "upload" | "ia">("axis");
  const [preview, setPreview] = useState<string | null>(null);
  const [savingIA, setSavingIA] = useState(false);

  // ---------------------------------------------------------
  // Helper : mettre à jour preview + remonter au parent
  // ---------------------------------------------------------
  function applyVisual(rectangle_url: string, square_url: string) {
    setPreview(rectangle_url || square_url || null);
    onChange({ rectangle_url, square_url });
  }

  // ---------------------------------------------------------
  // Mode IA : génération article
  // ---------------------------------------------------------
  async function generateAIVIsual() {
    if (!axes.length) {
      alert("Impossible : aucun axe sélectionné.");
      return;
    }

    const axe = axes[0]; // Convention : premier axe sélectionné

    if (!axe.square_url) {
      alert("Axe sans visuel. Upload ou sélection d'abord nécessaire.");
      return;
    }

    setSavingIA(true);

    const payload = {
      id_article: articleId,
      title,
      excerpt: "",
      axe_visual_square_url: axe.square_url,
    };

    const res = await api.post("/visuals/articles/generate-ai", payload);

    setSavingIA(false);

    if (res.status !== "ok") {
      console.error("Erreur AI:", res);
      alert("Erreur génération IA");
      return;
    }

    applyVisual(res.urls.rectangle, res.urls.square);
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-6 p-4 border rounded bg-white">

      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuel de l’article
      </h2>

      {/* MODES */}
      <div className="flex gap-6 border-b pb-2">
        {(["axis", "company", "upload", "ia"] as const).map((m) => (
          <button
            key={m}
            className={`pb-1 ${
              mode === m
                ? "border-b-2 border-ratecard-blue font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setMode(m)}
          >
            {m === "axis" && "Visuel d’un axe"}
            {m === "company" && "Visuel d’une société"}
            {m === "upload" && "Upload"}
            {m === "ia" && "Génération IA"}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------
         MODE AXE
      --------------------------------------------------------- */}
      {mode === "axis" && (
        <div className="space-y-3">
          {axes.length === 0 && (
            <p className="text-gray-500">Aucun axe sélectionné.</p>
          )}

          {axes.map((a) => (
            <div key={a.id_axe} className="flex items-center gap-4">
              {a.square_url && (
                <Image
                  src={a.square_url}
                  width={80}
                  height={80}
                  alt=""
                  className="border rounded bg-gray-50"
                />
              )}
              <button
                className="bg-ratecard-blue text-white px-3 py-1 rounded"
                onClick={() => {
                  if (!a.square_url) {
                    alert("Axe sans visuel configuré.");
                    return;
                  }
                  applyVisual(a.square_url, a.square_url);
                }}
              >
                Choisir {a.label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------
         MODE SOCIÉTÉ
      --------------------------------------------------------- */}
      {mode === "company" && (
        <div className="space-y-3">
          {companies.length === 0 && (
            <p className="text-gray-500">Aucune société sélectionnée.</p>
          )}

          {companies.map((c) => (
            <div key={c.id_company} className="flex items-center gap-4">
              {c.square_url && (
                <Image
                  src={c.square_url}
                  width={80}
                  height={80}
                  alt=""
                  className="border rounded bg-gray-50"
                />
              )}
              <button
                className="bg-ratecard-blue text-white px-3 py-1 rounded"
                onClick={() => {
                  if (!c.square_url) {
                    alert("Société sans visuel configuré.");
                    return;
                  }
                  applyVisual(c.square_url, c.square_url);
                }}
              >
                Choisir {c.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------
         MODE UPLOAD
      --------------------------------------------------------- */}
      {mode === "upload" && (
        <ArticleImageUploader
          articleId={articleId}
          title={title}
          onUploadComplete={({ rectangle_url, square_url }) => {
            applyVisual(rectangle_url, square_url);
          }}
        />
      )}

      {/* ---------------------------------------------------------
         MODE IA
      --------------------------------------------------------- */}
      {mode === "ia" && (
        <div>
          <button
            onClick={generateAIVIsual}
            disabled={savingIA}
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {savingIA ? "Génération…" : "Générer via IA"}
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------
         PREVIEW GLOBAL
      --------------------------------------------------------- */}
      {preview && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Aperçu final :</p>
          <Image
            src={preview}
            width={300}
            height={200}
            alt="visuel-final"
            className="border rounded bg-white"
          />
        </div>
      )}
    </div>
  );
}
