"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesSelector from "@/components/admin/AxesSelector";
import HtmlEditor from "@/components/admin/HtmlEditor";
import ArticleImageUploader from "@/components/admin/ArticleImageUploader";

type VisualMode = "none" | "axe" | "upload" | "ia";

export default function EditArticlePage({ params }) {
  const { id } = params;

  /* ---------------------------------------------
     STATE
  --------------------------------------------- */
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [resume, setResume] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [axes, setAxes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  const [visualMode, setVisualMode] = useState<VisualMode>("none");

  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
     LOAD ARTICLE
  --------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/articles/${id}`);
      if (!res?.article) {
        alert("Article introuvable");
        return;
      }

      const a = res.article;

      setTitle(a.TITRE || "");
      setResume(a.RESUME || "");
      setContentHtml(a.CONTENU_HTML || "");

      // AXES enriched already: [{ID_AXE, LABEL}]
      setAxes(a.axes || []);

      // COMPANIES enriched: [{ID_COMPANY, NAME}]
      setCompanies(a.companies || []);

      // PERSONS enriched: [{ID_PERSON, NAME, ROLE}]
      setPersons(a.persons || []);

      // MEDIA
      setMediaRectangleId(a.MEDIA_RECTANGLE_ID || null);
      setMediaSquareId(a.MEDIA_SQUARE_ID || null);

      if (a.media_rectangle_path) {
        setVisualUrl(`${process.env.NEXT_PUBLIC_GCS_BASE_URL}/${a.media_rectangle_path}`);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------
     APPLY AXIS VISUAL
  --------------------------------------------- */
  async function applyAxisVisual() {
    if (axes.length === 0) {
      alert("Choisis au moins un axe.");
      return;
    }

    const axe = axes[0];

    const res = await api.post("/visuals/article/apply-existing", {
      id_article: id,
      rectangle_url: axe.media_rectangle_url,
      square_url: axe.media_square_url,
    });

    if (res.status === "ok") {
      setMediaRectangleId(res.media_rectangle_id);
      setMediaSquareId(res.media_square_id);
      setVisualUrl(res.urls.rectangle);
    }
  }

  /* ---------------------------------------------
     UPLOAD
  --------------------------------------------- */
  async function handleUpload({ rectangle_id, rectangle_url, square_id, square_url }) {
    setMediaRectangleId(rectangle_id);
    setMediaSquareId(square_id);
    setVisualUrl(rectangle_url);
  }

  /* ---------------------------------------------
     IA VISUEL
  --------------------------------------------- */
  async function generateIA() {
    if (axes.length === 0) {
      alert("Un axe est obligatoire pour la génération IA.");
      return;
    }
    if (!title.trim() && !resume.trim()) {
      alert("Titre ou résumé requis.");
      return;
    }

    setIaLoading(true);

    const res = await api.post("/visuals/article/generate-ai", {
      id_article: id,
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
     UPDATE ARTICLE
  --------------------------------------------- */
  async function update() {
    if (!title.trim()) return alert("Titre manquant");
    if (axes.length === 0) return alert("Au moins un axe obligatoire");
    if (!mediaRectangleId || !mediaSquareId)
      return alert("Visuel obligatoire (axe / upload / IA)");

    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,

      axes: axes.map((a) => a.ID_AXE),
      companies: companies.map((c) => c.ID_COMPANY),
      persons: persons.map((p) => ({
        id_person: p.ID_PERSON,
        role: p.ROLE || null,
      })),

      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,
    };

    const res = await api.put(`/articles/update/${id}`, payload);

    setSaving(false);
    setResult(res);
  }

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------
     UI
  --------------------------------------------- */
  return (
    <div className="space-y-10">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier l’article
        </h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* EDITABLE FIELDS */}
      <input
        className="border p-2 w-full rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded h-24"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
      />

      <HtmlEditor value={contentHtml} onChange={setContentHtml} />

      {/* ENTITÉS */}
      <AxesSelector values={axes} onChange={setAxes} />
      <CompanySelector values={companies} onChange={setCompanies} />
      <PersonSelector values={persons} onChange={setPersons} />

      {/* ---------------------------------------------
         VISUEL
      --------------------------------------------- */}
      <div className="p-4 border rounded bg-white space-y-4">
        <h2 className="text-xl font-semibold">Visuel de l’article</h2>

        <div className="flex gap-6">
          <button
            onClick={() => pickMode("axe")}
            className={visualMode === "axe" ? "font-bold text-blue-600" : "text-gray-600"}
          >
            Depuis un axe
          </button>

          <button
            onClick={() => pickMode("upload")}
            className={visualMode === "upload" ? "font-bold text-blue-600" : "text-gray-600"}
          >
            Upload
          </button>

          <button
            onClick={() => pickMode("ia")}
            className={visualMode === "ia" ? "font-bold text-blue-600" : "text-gray-600"}
          >
            IA
          </button>
        </div>

        {/* MODE AXE */}
        {visualMode === "axe" && (
          <div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={applyAxisVisual}
            >
              Utiliser visuel axe
            </button>
          </div>
        )}

        {/* MODE UPLOAD */}
        {visualMode === "upload" && (
          <ArticleImageUploader onUploadComplete={handleUpload} />
        )}

        {/* MODE IA */}
        {visualMode === "ia" && (
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={generateIA}
            disabled={iaLoading}
          >
            {iaLoading ? "Génération…" : "Générer visuel IA"}
          </button>
        )}

        {visualUrl && (
          <img src={visualUrl} className="w-80 border rounded bg-white mt-3" />
        )}
      </div>

      {/* SAVE */}
      <button
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
        onClick={update}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
