"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// Sélecteurs modernisés
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import HtmlEditor from "@/components/admin/HtmlEditor";

// Nouveau bloc visuel unifié
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

export default function CreateArticlePage() {
  /* ---------------------------------------------------------
     CORE FIELDS
  --------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(""); // devient RESUME côté backend
  const [contentHtml, setContentHtml] = useState("");

  /* ---------------------------------------------------------
     ENTITÉS
  --------------------------------------------------------- */
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]);

  /* ---------------------------------------------------------
     VISUEL ARTICLE (rectangle + square) — via ArticleVisualSection
  --------------------------------------------------------- */
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);
  const [previewRectUrl, setPreviewRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     IA OLD DRAFT (source → article) — conservé
  --------------------------------------------------------- */
  const [sourceMode, setSourceMode] = useState<"scratch" | "source">("scratch");
  const [sourceType, setSourceType] = useState("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);

  async function generateDraft() {
    setLoadingDraft(true);

    const payload = {
      source_type: sourceType,
      source_text: sourceText,
      author: author || "",
    };

    const res = await api.post("/lab-light/transform", payload);

    if (res.draft?.title_proposal) setTitle(res.draft.title_proposal);
    if (res.draft?.excerpt) setResume(res.draft.excerpt);
    if (res.draft?.content_html) setContentHtml(res.draft.content_html);

    setLoadingDraft(false);
  }

  /* ---------------------------------------------------------
     CREATE ARTICLE
  --------------------------------------------------------- */
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function save() {
    if (!title.trim()) return alert("Merci de renseigner un titre");

    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,

      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,

      auteur: author || null,

      axes: axes.map((a) => a.id_axe),
      companies: companies.map((c) => c.id_company),
      persons: persons.map((p) => ({ id_person: p.id_person, role: "contributeur" })),
    };

    const res = await api.post("/articles/create", payload);
    setResult(res);
    setSaving(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Créer un article
        </h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* MODE SELECTEUR */}
      <div className="flex border-b">
        <button
          onClick={() => setSourceMode("scratch")}
          className={`px-4 py-2 ${
            sourceMode === "scratch"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }`}
        >
          From scratch
        </button>

        <button
          onClick={() => setSourceMode("source")}
          className={`px-4 py-2 ${
            sourceMode === "source"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }`}
        >
          Transformer une source
        </button>
      </div>

      {/* ----------------------------------------------------
          MODE FROM SCRATCH
      ---------------------------------------------------- */}
      {sourceMode === "scratch" && (
        <div className="space-y-6">

          {/* TITRE */}
          <input
            value={title}
            placeholder="Titre"
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full rounded"
          />

          {/* RESUME */}
          <textarea
            value={resume}
            placeholder="Résumé court"
            onChange={(e) => setResume(e.target.value)}
            className="border p-2 w-full h-24 rounded"
          />

          {/* CONTENU HTML */}
          <HtmlEditor value={contentHtml} onChange={setContentHtml} />

          {/* SELECTEURS */}
          <CompanySelector values={companies} onChange={setCompanies} multi />
          <PersonSelector values={persons} onChange={setPersons} multi />
          <AxesEditor values={axes} onChange={setAxes} multi />

          {/* VISUEL ARTICLE */}
          <ArticleVisualSection
            title={title}
            axes={axes}
            mediaRectangleId={mediaRectangleId}
            mediaSquareId={mediaSquareId}
            previewRectUrl={previewRectUrl}
            onChange={({ rectangleId, squareId, previewUrl }) => {
              setMediaRectangleId(rectangleId);
              setMediaSquareId(squareId);
              setPreviewRectUrl(previewUrl);
            }}
          />

          <button
            onClick={save}
            disabled={saving}
            className="bg-ratecard-blue text-white px-6 py-2 rounded"
          >
            {saving ? "Enregistrement…" : "Publier l’article"}
          </button>

          {result && (
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          MODE TRANSFORMER UNE SOURCE
      ---------------------------------------------------- */}
      {sourceMode === "source" && (
        <div className="space-y-6">
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="LINKEDIN_POST">Post LinkedIn</option>
            <option value="PRESS_RELEASE">Communiqué / Blog</option>
            <option value="INTERVIEW">Interview</option>
            <option value="EVENT_RECAP">Compte-rendu</option>
            <option value="OTHER">Autre</option>
          </select>

          <input
            placeholder="Auteur (optionnel)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <textarea
            placeholder="Source brute…"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="border p-2 rounded w-full h-48"
          />

          <button
            onClick={generateDraft}
            disabled={loadingDraft}
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {loadingDraft ? "Génération…" : "Transformer en article"}
          </button>
        </div>
      )}
    </div>
  );
}
