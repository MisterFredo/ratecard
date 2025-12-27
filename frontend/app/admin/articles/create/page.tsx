"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";
import HtmlEditor from "@/components/admin/HtmlEditor";

export default function CreateArticlePage() {
  const [activeTab, setActiveTab] = useState<"scratch" | "source">("scratch");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  // COMPANY = object now
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // PERSONS = array of objects now
  const [selectedPersons, setSelectedPersons] = useState<any[]>([]);

  // AXES = array of { id_axe, label }
  const [axes, setAxes] = useState<any[]>([]);

  // MEDIA (store URL + media_id)
  const [visuelUrl, setVisuelUrl] = useState("");
  const [visuelSquareUrl, setVisuelSquareUrl] = useState("");
  const [visuelId, setVisuelId] = useState<string | null>(null);
  const [visuelSquareId, setVisuelSquareId] = useState<string | null>(null);

  const [pickerVisuelOpen, setPickerVisuelOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [sourceType, setSourceType] = useState("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState("");
  const [draft, setDraft] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     IA DRAFT
  --------------------------------------------------------- */
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
    if (res.draft?.title_proposal) setTitle(res.draft.title_proposal);
    if (res.draft?.excerpt) setExcerpt(res.draft.excerpt);
    if (res.draft?.content_html) setContentHtml(res.draft.content_html);

    setLoadingDraft(false);
  }

  /* ---------------------------------------------------------
     IA VISUEL
  --------------------------------------------------------- */
  async function generateIA() {
    if (!title && !excerpt) {
      return alert("Merci de renseigner un titre ou un résumé");
    }

    setSaving(true);

    const payload = {
      title,
      excerpt,
      axes: axes.map(a => a.label),
      company: selectedCompany?.name || null,
    };

    const res = await api.post("/api/media/generate", payload);

    if (res.status === "ok") {
      // IDs + URLs
      setVisuelUrl(res.items.rectangle.url);
      setVisuelId(res.items.rectangle.media_id);

      setVisuelSquareUrl(res.items.square.url);
      setVisuelSquareId(res.items.square.media_id);
    }

    setSaving(false);
  }

  /* ---------------------------------------------------------
     PUBLISH ARTICLE (ancienne version)
  --------------------------------------------------------- */
  async function publishArticle() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt,
      contenu_html: contentHtml,

      visuel_url: visuelUrl,
      visuel_square_url: visuelSquareUrl,

      axes: axes.map(a => ({ label: a.label })),  // simplifié
      companies: selectedCompany ? [selectedCompany.id_company] : [],
      persons: selectedPersons.map(p => ({ id_person: p.id_person })),

      auteur: author || null,
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

      {activeTab === "scratch" && (
        <div className="space-y-6">

          <input
            placeholder="Titre"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-2 w-full rounded"
          />

          <textarea
            placeholder="Résumé"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            className="border p-2 w-full h-24 rounded"
          />

          <HtmlEditor value={contentHtml} onChange={setContentHtml} />

          {/* ENTITES */}
          <CompanySelector
            value={selectedCompany}
            onChange={setSelectedCompany}
          />
          <PersonSelector
            values={selectedPersons}
            onChange={setSelectedPersons}
          />
          <AxesEditor values={axes} onChange={setAxes} />

          {/* VISUEL */}
          <div className="space-y-4 p-4 border rounded bg-white">
            <h2 className="text-xl font-semibold text-ratecard-blue">
              Visuel de l’article
            </h2>

            <div className="flex gap-3">
              <button
                className="bg-ratecard-green text-white px-3 py-2 rounded"
                onClick={() => setPickerVisuelOpen(true)}
              >
                Choisir dans la médiathèque
              </button>

              <button
                className="bg-gray-700 text-white px-3 py-2 rounded"
                onClick={() => setUploaderOpen(true)}
              >
                Uploader un visuel
              </button>

              <button
                className="bg-ratecard-blue text-white px-3 py-2 rounded"
                onClick={generateIA}
                disabled={saving}
              >
                {saving ? "Génération…" : "Générer via IA"}
              </button>
            </div>

            {visuelUrl && (
              <div>
                <img
                  src={visuelUrl}
                  className="w-80 border rounded bg-white mt-2"
                />
              </div>
            )}
          </div>

          {/* MEDIA PICKER */}
          <MediaPicker
            open={pickerVisuelOpen}
            onClose={() => setPickerVisuelOpen(false)}
            category="articles"
            onSelect={(item) => {
              if (item.format === "square") {
                setVisuelSquareUrl(item.url);
                setVisuelSquareId(item.media_id);
              } else {
                setVisuelUrl(item.url);
                setVisuelId(item.media_id);
              }
            }}
          />

          {/* MEDIA UPLOADER */}
          {uploaderOpen && (
            <div className="border p-4 rounded bg-white">
              <MediaUploader
                category="articles"
                onUploadComplete={({ square, rectangle }) => {
                  setVisuelSquareUrl(square.url);
                  setVisuelSquareId(square.media_id);

                  setVisuelUrl(rectangle.url);
                  setVisuelId(rectangle.media_id);

                  setUploaderOpen(false);
                }}
              />
            </div>
          )}

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

      {/* SOURCE MODE */}
      {activeTab === "source" && (
        <div className="space-y-6">
          <select
            value={sourceType}
            onChange={e => setSourceType(e.target.value)}
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
            onChange={e => setAuthor(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <textarea
            placeholder="Source brute…"
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
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
                onChange={e => setTitle(e.target.value)}
                className="border p-2 w-full rounded font-semibold"
              />
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
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


