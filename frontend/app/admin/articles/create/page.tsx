// frontend/app/admin/articles/create/page.tsx

"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function CreateArticlePage() {
  const [activeTab, setActiveTab] = useState<"scratch" | "source">("scratch");

  // ---- STATE : FORM FROM SCRATCH ----
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [companies, setCompanies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [axes, setAxes] = useState([]);
  const [visuelUrl, setVisuelUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number | undefined>();

  // ---- STATE : LAB LIGHT SOURCE ----
  const [sourceType, setSourceType] = useState("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState("");
  const [draft, setDraft] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // ---- FINAL PUBLICATION ----
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);


  // ============================================================
  // 📌 APPEL LAB LIGHT pour transformer une source
  // ============================================================
  async function generateDraft() {
    setLoadingDraft(true);
    setDraft(null);

    const payload = {
      source_type: sourceType,
      source_text: sourceText,
      author: author || ""
    };

    const res = await api.post("/lab-light/transform", payload);
    setDraft(res.draft);
    setLoadingDraft(false);

    // Pré-remplit les champs issus du draft
    if (res.draft?.title_proposal) setTitle(res.draft.title_proposal);
    if (res.draft?.excerpt) setExcerpt(res.draft.excerpt);
    if (res.draft?.content_html) setContentHtml(res.draft.content_html);
  }


  // ============================================================
  // 📌 PUBLICATION ARTICLE FINAL
  // ============================================================
  async function publishArticle() {
    setPublishing(true);

    const payload = {
      titre: title,
      excerpt: excerpt,
      contenu_html: contentHtml,
      visuel_url: visuelUrl || null,
      auteur: author || null,
      is_featured: isFeatured,
      featured_order: featuredOrder || null,
      axes: axes,
      companies: companies,
      persons: persons
    };

    const res = await api.post("/articles/create", payload);
    setPublishResult(res);
    setPublishing(false);
  }


  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Créer un article</h1>

      {/* TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("scratch")}
          className={`px-4 py-2 ${activeTab === "scratch" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
        >
          From scratch
        </button>

        <button
          onClick={() => setActiveTab("source")}
          className={`px-4 py-2 ${activeTab === "source" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
        >
          Transformer une source
        </button>
      </div>

      {/* ============================================================
          ONGLET 1 — FROM SCRATCH
         ============================================================ */}
      {activeTab === "scratch" && (
        <div className="space-y-4">
          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
          />
          <textarea
            placeholder="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="border p-2 w-full h-20"
          />
          <textarea
            placeholder="Contenu HTML"
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            className="border p-2 w-full h-60 font-mono"
          />

          <input
            placeholder="URL Visuel"
            value={visuelUrl}
            onChange={(e) => setVisuelUrl(e.target.value)}
            className="border p-2 w-full"
          />

          {/* TODO : Sélecteurs companies, persons, axes */}
          <button
            onClick={publishArticle}
            disabled={publishing}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Publier
          </button>

          {publishResult && <pre className="bg-gray-100 p-4 mt-4">{JSON.stringify(publishResult, null, 2)}</pre>}
        </div>
      )}

      {/* ============================================================
          ONGLET 2 — TRANSFORMER UNE SOURCE (LAB LIGHT)
         ============================================================ */}
      {activeTab === "source" && (
        <div className="space-y-4">

          {/* Type de source */}
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="border p-2"
          >
            <option>LINKEDIN_POST</option>
            <option>PRESS_RELEASE</option>
            <option>INTERVIEW</option>
            <option>EVENT_RECAP</option>
            <option>OTHER</option>
          </select>

          {/* Auteur */}
          <input
            placeholder="Auteur (optionnel)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border p-2 w-full"
          />

          {/* Source brute */}
          <textarea
            placeholder="Collez ici la source brute..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="border p-2 w-full h-60"
          />

          <button
            onClick={generateDraft}
            className="bg-black text-white px-6 py-2 rounded"
            disabled={loadingDraft}
          >
            {loadingDraft ? "Génération..." : "Transformer en article"}
          </button>

          {/* PRÉVIEW DU DRAFT */}
          {draft && (
            <div className="mt-6 bg-gray-50 border p-4 rounded space-y-4">
              <h2 className="text-xl font-semibold">Preview Draft</h2>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 w-full font-semibold"
              />

              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="border p-2 w-full h-20"
              />

              <textarea
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                className="border p-2 w-full h-80 font-mono"
              />

              {/* TODO : Sélecteurs companies, persons, axes */}

              <button
                onClick={publishArticle}
                disabled={publishing}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                Publier l’article
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
