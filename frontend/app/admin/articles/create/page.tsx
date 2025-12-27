"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import HtmlEditor from "@/components/admin/HtmlEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import ArticleImageUploader from "@/components/admin/ArticleImageUploader";

export default function CreateArticlePage() {
  const [activeTab, setActiveTab] = useState<"scratch" | "source">("scratch");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedPersons, setSelectedPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]);

  /* ---------------------------------------------------------
     VISUEL : les 3 modes clean
  --------------------------------------------------------- */
  type VisualMode = "media" | "upload" | "ia";
  const [visualMode, setVisualMode] = useState<VisualMode>("media");

  const [visuelUrl, setVisuelUrl] = useState("");
  const [visuelSquareUrl, setVisuelSquareUrl] = useState("");
  const [visuelMediaId, setVisuelMediaId] = useState<string | null>(null);

  function resetVisual() {
    setVisuelUrl("");
    setVisuelSquareUrl("");
    setVisuelMediaId(null);
  }

  function selectMode(mode: VisualMode) {
    setVisualMode(mode);
    resetVisual(); // 1 = A (confirmé)
  }

  /* ---------------------------------------------------------
     IA VISUEL
  --------------------------------------------------------- */
  const [savingIA, setSavingIA] = useState(false);

  async function generateIA() {
    if (!title && !excerpt)
      return alert("Merci de renseigner un titre ou un résumé");

    setSavingIA(true);

    const payload = {
      title,
      excerpt,
      axes: axes.map((a) => a.label),
      company: selectedCompany?.name || null,
    };

    const res = await api.post("/api/media/generate", payload);

    if (res.status === "ok") {
      setVisuelUrl(res.items.rectangle.url);
      setVisuelSquareUrl(res.items.square.url);
    }

    setSavingIA(false);
  }

  /* ---------------------------------------------------------
     IA DRAFT (texte)
  --------------------------------------------------------- */
  const [sourceType, setSourceType] = useState("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState("");
  const [draft, setDraft] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  async function generateDraft() {
    setLoadingDraft(true);
    setDraft(null);

    const payload = {
      source_type: sourceType,
      source_text: sourceText,
      author: author || "",
    };

    const res = await api.post("/lab-light/transform", payload);

    if (res.draft?.title_proposal) setTitle(res.draft.title_proposal);
    if (res.draft?.excerpt) setExcerpt(res.draft.excerpt);
    if (res.draft?.content_html) setContentHtml(res.draft.content_html);

    setDraft(res.draft || null);
    setLoadingDraft(false);
  }

  /* ---------------------------------------------------------
     PUBLISH ARTICLE
  --------------------------------------------------------- */
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function publishArticle() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt,
      contenu_html: contentHtml,

      // 2 = B (confirmé) → on stocke uniquement les URLs finales
      visuel_url: visuelUrl,
      visuel_square_url: visuelSquareUrl,

      axes: axes.map((a) => ({ label: a.label })),
      companies: selectedCompany ? [selectedCompany.id_company] : [],
      persons: selectedPersons.map((p) => ({ id_person: p.id_person })),

      auteur: author || null,
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

      {/* GENERAL TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("scratch")}
          className={`px-4 py-2 ${
            activeTab === "scratch"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }`}
        >
          From scratch
        </button>

        <button
          onClick={() => setActiveTab("source")}
          className={`px-4 py-2 ${
            activeTab === "source"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }`}
        >
          Transformer une source
        </button>
      </div>

      {/* ----------------------------------------------------
          SCRATCH MODE
      ---------------------------------------------------- */}
      {activeTab === "scratch" && (
        <div className="space-y-6">

          {/* TITRE */}
          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full rounded"
          />

          {/* EXCERPT */}
          <textarea
            placeholder="Résumé"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="border p-2 w-full h-24 rounded"
          />

          {/* CONTENU */}
          <HtmlEditor value={contentHtml} onChange={setContentHtml} />

          {/* ENTITÉS */}
          <CompanySelector
            value={selectedCompany}
            onChange={setSelectedCompany}
          />
          <PersonSelector
            values={selectedPersons}
            onChange={setSelectedPersons}
          />
          <AxesEditor values={axes} onChange={setAxes} />

          {/* ----------------------------------------------------
              VISUEL — 3 MODES MODERNES (onglets)
          ---------------------------------------------------- */}
          <div className="space-y-4 p-4 border rounded bg-white">

            <h2 className="text-xl font-semibold text-ratecard-blue mb-2">
              Visuel de l’article
            </h2>

            {/* ONGLETS */}
            <div className="flex gap-4 border-b pb-2">
              <button
                className={`pb-1 ${
                  visualMode === "media"
                    ? "border-b-2 border-ratecard-blue font-semibold"
                    : "text-gray-500"
                }`}
                onClick={() => selectMode("media")}
              >
                Médiathèque
              </button>

              <button
                className={`pb-1 ${
                  visualMode === "upload"
                    ? "border-b-2 border-ratecard-blue font-semibold"
                    : "text-gray-500"
                }`}
                onClick={() => selectMode("upload")}
              >
                Upload
              </button>

              <button
                className={`pb-1 ${
                  visualMode === "ia"
                    ? "border-b-2 border-ratecard-blue font-semibold"
                    : "text-gray-500"
                }`}
                onClick={() => selectMode("ia")}
              >
                Génération IA
              </button>
            </div>

            {/* ---------------------------------------------------- */}
            {/* MODE 1 — MEDIATHÈQUE */}
            {/* ---------------------------------------------------- */}
            {visualMode === "media" && (
              <div>
                <MediaPicker
                  open={true}
                  onClose={() => {}}
                  category="generics" // l'utilisateur choisit dans les visuels génériques
                  onSelect={(item) => {
                    setVisuelMediaId(item.media_id);
                    setVisuelUrl(item.url);
                    setVisuelSquareUrl(""); // le DAM ne fournit pas de square
                  }}
                />
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 2 — UPLOAD LOCAL POUR ARTICLE */}
            {/* ---------------------------------------------------- */}
            {visualMode === "upload" && (
              <div>
                <ArticleImageUploader
                  onUploadComplete={({ rectangle_url, square_url }) => {
                    setVisuelUrl(rectangle_url);
                    setVisuelSquareUrl(square_url);
                  }}
                />
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 3 — IA */}
            {/* ---------------------------------------------------- */}
            {visualMode === "ia" && (
              <div className="space-y-2">
                <button
                  className="bg-ratecard-blue text-white px-3 py-2 rounded"
                  onClick={generateIA}
                  disabled={savingIA}
                >
                  {savingIA ? "Génération…" : "Générer via IA"}
                </button>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* PREVIEW VISUEL FINAL */}
            {/* ---------------------------------------------------- */}
            {visuelUrl && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Aperçu :</p>
                <img
                  src={visuelUrl}
                  className="w-80 border rounded bg-white"
                />
              </div>
            )}
          </div>

          {/* PUBLISH */}
          <button
            onClick={publishArticle}
            disabled={saving}
            className="bg-ratecard-blue text-white px-6 py-2 rounded"
          >
            Publier
          </button>

          {result && (
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          SOURCE MODE
      ---------------------------------------------------- */}
      {activeTab === "source" && (
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

          {draft && (
            <div className="p-4 border rounded bg-white space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 w-full rounded font-semibold"
              />
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="border p-2 w-full rounded h-24"
              />
              <HtmlEditor value={contentHtml} onChange={setContentHtml} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
