"use client";

import { useState } from "react";
import Link from "next/link";

import { api } from "@/lib/api";

import HtmlEditor from "@/components/admin/HtmlEditor";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesSelector from "@/components/admin/AxesSelector";
import ArticleVisualSelector from "@/components/admin/ArticleVisualSelector";

export default function CreateArticlePage() {
  const [activeTab, setActiveTab] = useState<"scratch" | "source">("scratch");

  // CORE FIELDS
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  // ENTITÉS
  const [axes, setAxes] = useState<any[]>([]);        // [{ id_axe, label, square_url }]
  const [companies, setCompanies] = useState<any[]>([]); // [{ id_company, name, square_url }]
  const [persons, setPersons] = useState<any[]>([]);  // [{ id_person, name, role }]

  // VISUELS FINAUX
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);
  const [visualUrls, setVisualUrls] = useState<{ rectangle_url: string; square_url: string } | null>(null);

  // IA draft
  const [sourceType, setSourceType] = useState("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState("");
  const [draft, setDraft] = useState<any>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  async function generateDraft() {
    setGeneratingDraft(true);
    setDraft(null);

    const payload = {
      source_type: sourceType,
      source_text: sourceText,
      author: author || ""
    };

    const res = await api.post("/lab-light/transform", payload);

    if (res.draft?.title_proposal) setTitle(res.draft.title_proposal);
    if (res.draft?.excerpt) setResume(res.draft.excerpt);
    if (res.draft?.content_html) setContentHtml(res.draft.content_html);

    setDraft(res.draft || null);
    setGeneratingDraft(false);
  }

  // ---------------------------------------------------------
  // PUBLISH
  // ---------------------------------------------------------
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function publish() {
    if (!title.trim()) {
      alert("Merci de renseigner un titre");
      return;
    }

    // On crée d'abord la ligne article pour obtenir son ID
    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,

      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,

      axes: axes.map(a => a.id_axe),
      companies: companies.map(c => c.id_company),
      persons: persons.map(p => ({
        id_person: p.id_person,
        role: p.role || null
      })),

      auteur: author || null,
    };

    const res = await api.post("/articles/create", payload);

    setSaving(false);
    setResult(res);
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">Créer un article</h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* TABS */}
      <div className="flex border-b gap-4">
        <button
          onClick={() => setActiveTab("scratch")}
          className={`pb-2 ${
            activeTab === "scratch"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }`}
        >
          Rédaction libre
        </button>

        <button
          onClick={() => setActiveTab("source")}
          className={`pb-2 ${
            activeTab === "source"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }`}
        >
          Transformer une source
        </button>
      </div>

      {/* ---------------------------------------------------------
         MODE SCRATCH
      --------------------------------------------------------- */}
      {activeTab === "scratch" && (
        <div className="space-y-8">

          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full rounded"
          />

          <textarea
            placeholder="Résumé"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="border p-2 w-full h-24 rounded"
          />

          <HtmlEditor value={contentHtml} onChange={setContentHtml} />

          <AxesSelector values={axes} onChange={setAxes} />
          <CompanySelector values={companies} onChange={setCompanies} />
          <PersonSelector values={persons} onChange={setPersons} />

          {/* -----------------------------------------------------
             VISUEL UNIQUE (selector modernisé)
          ----------------------------------------------------- */}
          <ArticleVisualSelector
            articleId="new"       // Front-only ; backend upload ne dépend pas encore de l'ID
            title={title}
            axes={axes}
            companies={companies}
            onChange={(urls) => {
              setVisualUrls(urls);
              // Ces IDs doivent venir de l’API upload
              // On les mettra à jour plus tard dans la version finale
            }}
          />

          <button
            onClick={publish}
            disabled={saving}
            className="bg-ratecard-blue text-white px-6 py-2 rounded"
          >
            {saving ? "Enregistrement…" : "Publier"}
          </button>

          {result && (
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap mt-4">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------
         MODE TRANSFORMATION SOURCE
      --------------------------------------------------------- */}
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
            placeholder="Auteur"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <textarea
            placeholder="Contenu brut…"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="border p-2 rounded w-full h-48"
          />

          <button
            onClick={generateDraft}
            disabled={generatingDraft}
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {generatingDraft ? "Génération…" : "Transformer en article"}
          </button>

          {draft && (
            <div className="p-4 border rounded bg-white space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 w-full rounded font-semibold"
              />
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
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
