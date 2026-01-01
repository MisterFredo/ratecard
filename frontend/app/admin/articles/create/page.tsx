"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesSelector from "@/components/admin/AxesSelector";
import HtmlEditor from "@/components/admin/HtmlEditor";

import ArticleImageUploader from "@/components/admin/ArticleImageUploader";
import MediaPicker from "@/components/admin/MediaPicker";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreateArticlePage() {
  /* ---------------------------------------------------------
     TEXTE
  --------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(""); // texte NL + Home
  const [contentHtml, setContentHtml] = useState("");

  /* ---------------------------------------------------------
     ENTITÉS
  --------------------------------------------------------- */
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]); // ID_AXE[]

  /* ---------------------------------------------------------
     VISUELS
  --------------------------------------------------------- */
  const [visualMode, setVisualMode] = useState<"axe" | "company" | "upload" | "ia">(
    "axe"
  );

  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);

  const [mediaRectangleUrl, setMediaRectangleUrl] = useState<string | null>(null);
  const [mediaSquareUrl, setMediaSquareUrl] = useState<string | null>(null);

  const resetVisual = () => {
    setMediaRectangleId(null);
    setMediaSquareId(null);
    setMediaRectangleUrl(null);
    setMediaSquareUrl(null);
  };

  /* ---------------------------------------------------------
     MODE IA → uniquement basé sur AXE(S)
  --------------------------------------------------------- */
  const [generatingAI, setGeneratingAI] = useState(false);

  async function generateAI() {
    if (!title && !resume) {
      alert("Merci d’indiquer un titre ou un résumé.");
      return;
    }
    if (axes.length === 0) {
      alert("La génération IA nécessite au moins un axe éditorial.");
      return;
    }

    setGeneratingAI(true);

    const payload = {
      id_article: "temp", // sera remplacé lors du update après création
      title,
      excerpt: resume,
      axe_ids: axes, // 1..N
    };

    const res = await api.post("/visuals/article/generate-ai", payload);
    setGeneratingAI(false);

    if (res.status !== "ok") {
      alert("Erreur IA : " + res.message);
      return;
    }

    setMediaRectangleId(res.media_rectangle_id);
    setMediaSquareId(res.media_square_id);
    setMediaRectangleUrl(res.urls.rectangle);
    setMediaSquareUrl(res.urls.square);
  }

  /* ---------------------------------------------------------
     PUBLICATION ARTICLE
  --------------------------------------------------------- */
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function publish() {
    if (!title.trim()) return alert("Titre requis");
    if (axes.length === 0) return alert("Un article doit être associé à ≥ 1 axe.");

    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,
      axes, // 1..N
      companies: companies.map((c) => c.id_company),
      persons: persons.map((p) => ({ id_person: p.id_person, role: p.role })),

      media_rectangle_id,
      media_square_id,

      auteur: null,
      is_featured: false,
      featured_order: null,
    };

    const res = await api.post("/articles/create", payload);
    setSaving(false);
    setResult(res);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Créer un article
        </h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* ---------------------------------------------------------
         SECTION TEXTE
      --------------------------------------------------------- */}
      <div className="space-y-4">
        <input
          placeholder="Titre de l’article"
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Résumé / accroche"
          className="border p-2 w-full rounded h-24"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
        />

        <HtmlEditor value={contentHtml} onChange={setContentHtml} />
      </div>

      {/* ---------------------------------------------------------
         ENTITÉS
      --------------------------------------------------------- */}
      <AxesSelector values={axes} onChange={setAxes} />
      <CompanySelector values={companies} onChange={setCompanies} multi />
      <PersonSelector values={persons} onChange={setPersons} multi />

      {/* ---------------------------------------------------------
         VISUELS
      --------------------------------------------------------- */}
      <div className="border rounded p-4 space-y-4 bg-white">
        <h2 className="text-xl font-semibold text-ratecard-blue">
          Visuel de l’article
        </h2>

        {/* TABS */}
        <div className="flex gap-4 border-b pb-2">
          <button
            onClick={() => {
              setVisualMode("axe");
              resetVisual();
            }}
            className={`pb-1 ${
              visualMode === "axe" ? "border-b-2 border-ratecard-blue" : "text-gray-500"
            }`}
          >
            Visuel(s) axe
          </button>

          <button
            onClick={() => {
              setVisualMode("company");
              resetVisual();
            }}
            className={`pb-1 ${
              visualMode === "company"
                ? "border-b-2 border-ratecard-blue"
                : "text-gray-500"
            }`}
          >
            Visuels société
          </button>

          <button
            onClick={() => {
              setVisualMode("upload");
              resetVisual();
            }}
            className={`pb-1 ${
              visualMode === "upload"
                ? "border-b-2 border-ratecard-blue"
                : "text-gray-500"
            }`}
          >
            Upload local
          </button>

          <button
            onClick={() => {
              setVisualMode("ia");
              resetVisual();
            }}
            className={`pb-1 ${
              visualMode === "ia"
                ? "border-b-2 border-ratecard-blue"
                : "text-gray-500"
            }`}
          >
            IA (via axes)
          </button>
        </div>

        {/* MODE AXE */}
        {visualMode === "axe" && (
          <div>
            {axes.length === 0 ? (
              <p className="text-xs text-red-500">
                Associe un axe pour afficher ses visuels.
              </p>
            ) : (
              <>
                <MediaPicker
                  open={true}
                  onClose={() => {}}
                  folders={["axes"]}
                  onSelect={(item) => {
                    setMediaRectangleId(item.media_id);
                    setMediaRectangleUrl(item.url);
                    resetVisual();
                  }}
                />

                {/* preview */}
                {mediaRectangleUrl && (
                  <img
                    src={mediaRectangleUrl}
                    className="w-80 border rounded bg-white mt-2"
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* MODE COMPANY */}
        {visualMode === "company" && (
          <div>
            {companies.length === 0 ? (
              <p className="text-xs text-red-500">
                Associe au moins une société pour afficher leurs visuels.
              </p>
            ) : (
              <MediaPicker
                open={true}
                onClose={() => {}}
                folders={["companies"]}
                onSelect={(item) => {
                  setMediaRectangleId(item.media_id);
                  setMediaRectangleUrl(item.url);
                }}
              />
            )}

            {mediaRectangleUrl && (
              <img
                src={mediaRectangleUrl}
                className="w-80 border rounded bg-white mt-2"
              />
            )}
          </div>
        )}

        {/* MODE UPLOAD */}
        {visualMode === "upload" && (
          <ArticleImageUploader
            onUploadComplete={(r) => {
              setMediaRectangleId(r.rectangle_id);
              setMediaSquareId(r.square_id);
              setMediaRectangleUrl(r.rectangle_url);
              setMediaSquareUrl(r.square_url);
            }}
          />
        )}

        {/* MODE IA */}
        {visualMode === "ia" && (
          <button
            onClick={generateAI}
            disabled={generatingAI}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {generatingAI ? "Génération…" : "Générer via IA"}
          </button>
        )}

        {mediaRectangleUrl && (
          <div>
            <p className="text-xs text-gray-500 mt-2">Aperçu :</p>
            <img
              src={mediaRectangleUrl}
              className="w-80 border rounded bg-white mt-1"
            />
          </div>
        )}
      </div>

      {/* PUBLISH */}
      <button
        onClick={publish}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Publication…" : "Publier"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
