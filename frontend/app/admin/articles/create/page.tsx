// frontend/app/admin/articles/create/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";

export default function CreateArticlePage() {
  const [activeTab, setActiveTab] = useState<"scratch" | "source">("scratch");

  // ----------------------------------
  // FORM FIELDS (COMMON)
  // ----------------------------------
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPersons, setSelectedPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]); // now objects: {TYPE, LABEL}

  const [visuelUrl, setVisuelUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number | undefined>();

  // ----------------------------------
  // LAB LIGHT
  // ----------------------------------
  const [sourceType, setSourceType] = useState("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState("");

  const [draft, setDraft] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // ----------------------------------
  // PUBLICATION
  // ----------------------------------
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);


  // ============================================================
  //   TRANSFORMER UNE SOURCE -> LAB LIGHT
  // ============================================================
  async function generateDraft() {
    setLoadingDraft(true);
    setDraft(null);

    const payload = {
      source_type: sourceType,
      source_text: sourceText,
      author: author || "",
    };

    const res = await api.post("/lab-light/transform", payload);
    setDraft(res.draft || null);
    setLoadingDraft(false);

    if (res.draft?.title_proposal) setTitle(res.draft.title_proposal);
    if (res.draft?.excerpt) setExcerpt(res.draft.excerpt);
    if (res.draft?.content_html) setContentHtml(res.draft.content_html);
  }


  // ============================================================
  //   PUBLICATION ARTICLE COMPLET
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

      // AXES : conversion vers backend
      axes: axes.map((a) => ({
        type: a.TYPE,
        value: a.LABEL
      })),

      // 1 société max V1
      companies: selectedCompany ? [selectedCompany] : [],

      // personnes multi
      persons: selectedPersons.map((id) => ({
        id_person: id,
        role: null
      })),
    };

    const res = await api.post("/articles/create", payload);
    setPublishResult(res);
    setPublishing(false);
  }



  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Créer un article</h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>


      {/* TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("scratch")}
          className={`px-4 py-2 ${
            activeTab === "scratch" ? "border-b-2 border-black font-semibold" : "text-gray-500"
          }`}
        >
          From scratch
        </button>

        <button
          onClick={() => setActiveTab("source")}
          className={`px-4 py-2 ${
            activeTab === "source" ? "border-b-2 border-black font-semibold" : "text-gray-500"
          }`}
        >
          Transformer une source
        </button>
      </div>



      {/* ================================================================= */}
      {/*                        ONGLET : FROM SCRATCH                     */}
      {/* ================================================================= */}
      {activeTab === "scratch" && (
        <div className="space-y-6">

          {/* TITRE */}
          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
          />

          {/* EXCERPT */}
          <textarea
            placeholder="Résumé"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="border p-2 w-full h-24"
          />

          {/* HTML */}
          <textarea
            placeholder="Contenu HTML"
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            className="border p-2 w-full h-96 font-mono"
          />


          {/* COMPANY */}
          <CompanySelector
            value={selectedCompany}
            onChange={setSelectedCompany}
          />

          {/* PERSONS */}
          <PersonSelector
            values={selectedPersons}
            onChange={setSelectedPersons}
          />


          {/* AXES MANAGER */}
          <AxesEditor
            values={axes}
            onChange={setAxes}
          />

          {/* VISUEL */}
          <input
            placeholder="Visuel (URL)"
            value={visuelUrl}
            onChange={(e) => setVisuelUrl(e.target.value)}
            className="border p-2 w-full"
          />


          {/* FEATURED */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <span>Mettre en avant</span>
          </label>

          {isFeatured && (
            <input
              type="number"
              min={1}
              max={3}
              value={featuredOrder || ""}
              onChange={(e) => setFeaturedOrder(Number(e.target.value))}
              className="border p-2 w-32"
            />
          )}


          {/* PUBLISH BUTTON */}
          <button
            onClick={publishArticle}
            disabled={publishing}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Publier
          </button>

          {publishResult && (
            <pre className="bg-gray-100 p-4 rounded mt-4">
              {JSON.stringify(publishResult, null, 2)}
            </pre>
          )}
        </div>
      )}





      {/* ================================================================= */}
      {/*                  ONGLET : TRANSFORMER UNE SOURCE                  */}
      {/* ================================================================= */}
      {activeTab === "source" && (
        <div className="space-y-6">

          {/* TYPE DE SOURCE */}
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="LINKEDIN_POST">Post LinkedIn</option>
            <option value="PRESS_RELEASE">Communiqué de presse / Blog</option>
            <option value="INTERVIEW">Interview (transcript)</option>
            <option value="EVENT_RECAP">Compte-rendu / Note</option>
            <option value="OTHER">Autre</option>
          </select>

          {/* AUTEUR */}
          <input
            placeholder="Auteur (optionnel)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border p-2 w-full"
          />

          {/* SOURCE BRUTE */}
          <textarea
            placeholder="Collez ici la source brute…"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="border p-2 w-full h-60"
          />


          {/* CALL LAB LIGHT */}
          <button
            onClick={generateDraft}
            disabled={loadingDraft}
            className="bg-black text-white px-6 py-2 rounded"
          >
            {loadingDraft ? "Génération…" : "Transformer en article"}
          </button>


          {/* PREVIEW DRAFT */}
          {draft && (
            <div className="mt-6 bg-gray-50 border p-4 rounded space-y-4">
              <h2 className="text-xl font-semibold">Preview Draft</h2>

              {/* TITRE */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 w-full font-semibold"
              />

              {/* EXCERPT */}
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="border p-2 w-full h-24"
              />

              {/* HTML */}
              <textarea
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                className="border p-2 w-full h-96 font-mono"
              />


              {/* COMPANY */}
              <CompanySelector value={selectedCompany} onChange={setSelectedCompany} />

              {/* PERSONS */}
              <PersonSelector values={selectedPersons} onChange={setSelectedPersons} />

              {/* AXES */}
              <AxesEditor values={axes} onChange={setAxes} />


              {/* VISUEL */}
              <input
                placeholder="Visuel (URL)"
                value={visuelUrl}
                onChange={(e) => setVisuelUrl(e.target.value)}
                className="border p-2 w-full"
              />


              {/* FEATURED */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <span>Mettre en avant</span>
              </label>

              {isFeatured && (
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={featuredOrder || ""}
                  onChange={(e) => setFeaturedOrder(Number(e.target.value))}
                  className="border p-2 w-32"
                />
              )}


              {/* PUBLISH */}
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
