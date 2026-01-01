"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import AxeSelector from "@/components/admin/AxeSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";

// Nouveau module unifié pour visuels Article (upload / IA)
import ArticleVisualSection from "./VisualSection";

export default function CreateArticlePage() {
  const [activeTab, setActiveTab] = useState<"scratch" | "source">("scratch");

  // ==== CHAMPS ARTICLES ====
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentRaw, setContentRaw] = useState("");

  // ==== RELATIONS ====
  const [selectedAxes, setSelectedAxes] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);

  // ==== VISUELS ====
  const [visualRectId, setVisualRectId] = useState<string | null>(null);
  const [visualSquareId, setVisualSquareId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ==== IA TEXT DRAFT ====
  const [sourceType, setSourceType] = useState("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [sourceAuthor, setSourceAuthor] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);

  async function generateDraft() {
    if (!sourceText.trim()) return;

    setDraftLoading(true);

    const res = await api.post("/lab-light/transform", {
      source_type: sourceType,
      source_text: sourceText,
      author: sourceAuthor || "",
    });

    if (res?.draft?.title_proposal) setTitle(res.draft.title_proposal);
    if (res?.draft?.excerpt) setExcerpt(res.draft.excerpt);
    if (res?.draft?.content_html)
      setContentRaw(res.draft.content_html); // le back HTMLise totalement

    setDraftLoading(false);
  }

  // ==== SUBMIT ====
  async function save() {
    if (!title.trim()) return alert("Merci d’indiquer un titre");
    if (selectedAxes.length === 0)
      return alert("Un article doit contenir au moins un axe éditorial");

    setSaving(true);

    const payload = {
      title,
      excerpt,
      content_raw: contentRaw,

      axes: selectedAxes,
      companies: selectedCompanies,
      persons: selectedPersons,

      media_rectangle_id: visualRectId,
      media_square_id: visualSquareId,
    };

    const res = await api.post("/articles/create", payload);
    setResult(res);
    setSaving(false);
  }

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

      {/* TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("scratch")}
          className={`px-4 py-2 ${activeTab === "scratch"
            ? "border-b-2 border-ratecard-blue font-semibold"
            : "text-gray-500"
            }`}
        >
          From scratch
        </button>

        <button
          onClick={() => setActiveTab("source")}
          className={`px-4 py-2 ${activeTab === "source"
            ? "border-b-2 border-ratecard-blue font-semibold"
            : "text-gray-500"
            }`}
        >
          Transformer une source
        </button>
      </div>

      {/* ===================== SCRATCH ===================== */}
      {activeTab === "scratch" && (
        <div className="space-y-6">

          {/* TITLE */}
          <input
            className="border p-3 rounded w-full"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* EXCERPT */}
          <textarea
            className="border p-3 rounded w-full h-24"
            placeholder="Résumé bref"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          {/* CONTENT RAW */}
          <textarea
            className="border p-3 rounded w-full h-56"
            placeholder="Contenu (texte brut, le backend génère le HTML)"
            value={contentRaw}
            onChange={(e) => setContentRaw(e.target.value)}
          />

          {/* AXES */}
          <AxeSelector value={selectedAxes} onChange={setSelectedAxes} />

          {/* COMPANIES */}
          <CompanySelector value={selectedCompanies} onChange={setSelectedCompanies} />

          {/* PERSONS */}
          <PersonSelector value={selectedPersons} onChange={setSelectedPersons} />

          {/* VISUALS (upload / IA / reset) */}
          <ArticleVisualSection
            axes={selectedAxes}
            companies={selectedCompanies}
            title={title}
            excerpt={excerpt}
            rectangleId={visualRectId}
            squareId={visualSquareId}
            onChangeRectangle={setVisualRectId}
            onChangeSquare={setVisualSquareId}
          />

          {/* SUBMIT */}
          <button
            onClick={save}
            disabled={saving}
            className="bg-ratecard-blue text-white px-6 py-2 rounded"
          >
            {saving ? "Enregistrement…" : "Créer l’article"}
          </button>

          {result && (
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* ===================== SOURCE MODE ===================== */}
      {activeTab === "source" && (
        <div className="space-y-6">

          {/* TYPE DE SOURCE */}
          <select
            className="border p-2 rounded"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
          >
            <option value="LINKEDIN_POST">Post LinkedIn</option>
            <option value="PRESS_RELEASE">Communiqué / Blog</option>
            <option value="INTERVIEW">Interview</option>
            <option value="EVENT_RECAP">Compte-rendu</option>
            <option value="OTHER">Autre</option>
          </select>

          {/* AUTEUR */}
          <input
            className="border p-2 rounded w-full"
            placeholder="Auteur (optionnel)"
            value={sourceAuthor}
            onChange={(e) => setSourceAuthor(e.target.value)}
          />

          {/* TEXTE SOURCE */}
          <textarea
            className="border p-3 rounded w-full h-48"
            placeholder="Texte source…"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />

          {/* GENERATE DRAFT */}
          <button
            onClick={generateDraft}
            disabled={draftLoading}
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {draftLoading ? "Génération…" : "Transformer"}
          </button>

          {/* DRAFT ÉDITABLE */}
          {(title || excerpt || contentRaw) && (
            <div className="space-y-4 p-4 border rounded bg-white">

              <input
                className="border p-2 rounded w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                className="border p-2 rounded w-full h-24"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />

              <textarea
                className="border p-2 rounded w-full h-56"
                value={contentRaw}
                onChange={(e) => setContentRaw(e.target.value)}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
}

