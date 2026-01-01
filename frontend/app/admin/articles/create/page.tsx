"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesSelector from "@/components/admin/AxesSelector";
import HtmlEditor from "@/components/admin/HtmlEditor";
import ArticleImageUploader from "@/components/admin/ArticleImageUploader";

// -------------------------------------------------------
// TYPES VISUELS
// -------------------------------------------------------
type VisualMode = "none" | "axe" | "upload" | "ia";

export default function CreateArticlePage() {
  /* ---------------------------------------------
     FIELDS
  --------------------------------------------- */
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [axes, setAxes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  /* ---------------------------------------------
     VISUEL (UN SEUL)
  --------------------------------------------- */
  const [visualMode, setVisualMode] = useState<VisualMode>("none");

  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);

  function resetVisual() {
    setMediaRectangleId(null);
    setMediaSquareId(null);
    setVisualUrl(null);
  }

  function pickMode(mode: VisualMode) {
    setVisualMode(mode);
    resetVisual();
  }

  /* ---------------------------------------------
     VISUEL PAR AXE (mode A)
  --------------------------------------------- */
  async function applyAxisVisual() {
    if (axes.length === 0) {
      alert("Choisis au moins un axe.");
      return;
    }

    const axis = axes[0]; // axe principal
    const res = await api.post("/visuals/article/apply-existing", {
      id_article: "temp", // backend override via return-only (no update)
      rectangle_url: axis.media_rectangle_url,
      square_url: axis.media_square_url,
    });

    if (res.status === "ok") {
      setVisualUrl(res.urls.rectangle);
      setMediaRectangleId(res.media_rectangle_id);
      setMediaSquareId(res.media_square_id);
    }
  }

  /* ---------------------------------------------
     VISUEL UPLOAD (mode B)
  --------------------------------------------- */
  async function handleUpload({ rectangle_id, rectangle_url, square_id, square_url }) {
    setMediaRectangleId(rectangle_id);
    setMediaSquareId(square_id);
    setVisualUrl(rectangle_url);
  }

  /* ---------------------------------------------
     IA VISUEL (inspiré AXE uniquement)
  --------------------------------------------- */
  const [iaLoading, setIaLoading] = useState(false);

  async function generateIA() {
    if (axes.length === 0) {
      alert("Un axe est obligatoire pour la génération IA.");
      return;
    }
    if (!title.trim() && !resume.trim()) {
      alert("Titre ou résumé requis pour IA.");
      return;
    }

    setIaLoading(true);

    const res = await api.post("/visuals/article/generate-ai", {
      id_article: "temp", // backend ignore pour generate-only
      title,
      excerpt: resume,
      axe_visual_square_url: axes[0].media_square_url,
    });

    if (res.status === "ok") {
      setMediaRectangleId(res.media_rectangle_id);
      setMediaSquareId(res.media_square_id);
      setVisualUrl(res.urls.rectangle);
    }

    setIaLoading(false);
  }

  /* ---------------------------------------------
     SAVE
  --------------------------------------------- */
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function save() {
    if (!title.trim()) return alert("Titre manquant");
    if (axes.length === 0) return alert("Au moins un axe obligatoire");
    if (!mediaRectangleId || !mediaSquareId)
      return alert("Un visuel est obligatoire (axe / upload / IA)");

    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,

      axes: axes.map((a) => a.id_axe),
      companies: companies.map((c) => c.ID_COMPANY),
      persons: persons.map((p) => ({
        id_person: p.ID_PERSON,
        role: p.ROLE || null,
      })),

      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,
    };

    const res = await api.post("/articles/create", payload);
    setSaving(false);
    setResult(res);
  }

  /* ---------------------------------------------
     UI
  --------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">Créer un article</h1>

        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* TEXT FIELDS */}
      <input
        placeholder="Titre de l’article"
        className="border p-2 w-full rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Résumé"
        className="border p-2 w-full rounded h-24"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
      />

      <HtmlEditor value={contentHtml} onChange={setContentHtml} />

      {/* ENTITIES */}
      <AxesSelector values={axes} onChange={setAxes} />
      <CompanySelector values={companies} onChange={setCompanies} />
      <PersonSelector values={persons} onChange={setPersons} />

      {/* VISUEL */}
      <div className="p-4 border rounded bg-white space-y-4">
        <h2 className="text-xl font-semibold">Visuel de l’article</h2>

        {/* MODES */}
        <div className="flex gap-6">
          <button
            className={visualMode === "axe" ? "font-bold text-blue-600" : "text-gray-600"}
            onClick={() => pickMode("axe")}
          >
            Depuis un axe
          </button>

          <button
            className={visualMode === "upload" ? "font-bold text-blue-600" : "text-gray-600"}
            onClick={() => pickMode("upload")}
          >
            Upload
          </button>

          <button
            className={visualMode === "ia" ? "font-bold text-blue-600" : "text-gray-600"}
            onClick={() => pickMode("ia")}
          >
            Génération IA
          </button>
        </div>

        {/* AXE MODE */}
        {visualMode === "axe" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              Utilise le visuel principal du premier axe sélectionné.
            </p>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={applyAxisVisual}
            >
              Utiliser visuel de l’axe
            </button>
          </div>
        )}

        {/* UPLOAD MODE */}
        {visualMode === "upload" && (
          <ArticleImageUploader onUploadComplete={handleUpload} />
        )}

        {/* IA MODE */}
        {visualMode === "ia" && (
          <div>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded"
              onClick={generateIA}
              disabled={iaLoading}
            >
              {iaLoading ? "Génération…" : "Générer le visuel IA"}
            </button>
          </div>
        )}

        {/* PREVIEW */}
        {visualUrl && (
          <div>
            <img src={visualUrl} className="w-80 border rounded bg-white" />
          </div>
        )}
      </div>

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Publier l’article"}
      </button>

      {result && (
        <pre className="bg-gray-100 mt-4 p-4 rounded whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
