"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { api } from "@/lib/api";

import HtmlEditor from "@/components/admin/HtmlEditor";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";

import MediaPicker from "@/components/admin/MediaPicker";
import ArticleImageUploader from "@/components/admin/ArticleImageUploader";

const GCS_BASE = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

// -----------------------------------------------------------------------------
// EDIT ARTICLE PAGE
// -----------------------------------------------------------------------------
export default function EditArticlePage({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // BASIC FIELDS
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [auteur, setAuteur] = useState("");

  // RELATIONS
  const [axes, setAxes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  // VISUELS
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);

  const [visuelRectUrl, setVisuelRectUrl] = useState<string | null>(null);
  const [visuelSquareUrl, setVisuelSquareUrl] = useState<string | null>(null);

  // UI
  type VisualMode = "picker" | "upload" | "ia";
  const [visualMode, setVisualMode] = useState<VisualMode>("picker");
  const [pickerOpen, setPickerOpen] = useState(false);

  // IA VISUEL
  const [loadingIA, setLoadingIA] = useState(false);

  // ---------------------------------------------------------------------------
  // LOAD ARTICLE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/articles/${id}`);
      const a = res.article;

      setTitle(a.TITRE || "");
      setResume(a.RESUME || "");
      setContentHtml(a.CONTENU_HTML || "");
      setAuteur(a.AUTEUR || "");

      // Relations enrichies
      setAxes(a.axes || []);
      setCompanies(a.companies || []);
      setPersons(a.persons || []);

      // MEDIA IDS
      setMediaRectangleId(a.MEDIA_RECTANGLE_ID || null);
      setMediaSquareId(a.MEDIA_SQUARE_ID || null);

      // GCS URLs reconstruites
      if (a.media_rectangle_path) {
        setVisuelRectUrl(`${GCS_BASE}/${a.media_rectangle_path}`);
      }
      if (a.media_square_path) {
        setVisuelSquareUrl(`${GCS_BASE}/${a.media_square_path}`);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // ---------------------------------------------------------------------------
  // IA : Génération visuel à partir des axes
  // ---------------------------------------------------------------------------
  async function generateIA() {
    if (!title.trim() && !resume.trim()) {
      alert("Merci de saisir un titre ou un résumé.");
      return;
    }

    if (!axes || axes.length === 0) {
      alert("Un ou plusieurs axes sont requis pour la génération IA.");
      return;
    }

    setLoadingIA(true);

    const payload = {
      id_article: id,
      title,
      resume,
      axe_ids: axes.map((a) => a.ID_AXE),
    };

    const res = await api.post("/visuals/articles/ai", payload);

    if (res.status === "ok") {
      setMediaRectangleId(res.media_rectangle_id);
      setMediaSquareId(res.media_square_id);

      setVisuelRectUrl(res.urls.rectangle);
      setVisuelSquareUrl(res.urls.square);
    }

    setLoadingIA(false);
  }

  // ---------------------------------------------------------------------------
  // UPDATE ARTICLE
  // ---------------------------------------------------------------------------
  async function update() {
    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,
      auteur,

      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,

      axes: axes.map((a) => a.ID_AXE),
      companies: companies.map((c) => c.ID_COMPANY),
      persons: persons.map((p) => ({
        id_person: p.ID_PERSON,
        role: p.ROLE || null,
      })),
    };

    const res = await api.put(`/articles/update/${id}`, payload);

    if (res.status !== "ok") {
      alert("Erreur lors de la mise à jour");
    } else {
      alert("Article mis à jour !");
    }

    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier un article
        </h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* TITRE */}
      <input
        className="border p-2 w-full rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
      />

      {/* RESUME */}
      <textarea
        className="border p-2 w-full rounded h-24"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        placeholder="Résumé"
      />

      {/* CONTENU */}
      <HtmlEditor value={contentHtml} onChange={setContentHtml} />

      {/* ENTITÉS */}
      <AxesEditor values={axes} onChange={setAxes} />
      <CompanySelector values={companies} onChange={setCompanies} />
      <PersonSelector values={persons} onChange={setPersons} />

      {/* VISUEL */}
      <div className="p-4 border rounded bg-white space-y-4">
        <h2 className="text-xl font-semibold text-ratecard-blue">
          Visuel principal
        </h2>

        {/* Onglets */}
        <div className="flex gap-4 border-b pb-2">
          <button
            onClick={() => setVisualMode("picker")}
            className={`pb-1 ${
              visualMode === "picker"
                ? "border-b-2 border-ratecard-blue font-semibold"
                : "text-gray-500"
            }`}
          >
            Choisir
          </button>
          <button
            onClick={() => setVisualMode("upload")}
            className={`pb-1 ${
              visualMode === "upload"
                ? "border-b-2 border-ratecard-blue font-semibold"
                : "text-gray-500"
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setVisualMode("ia")}
            className={`pb-1 ${
              visualMode === "ia"
                ? "border-b-2 border-ratecard-blue font-semibold"
                : "text-gray-500"
            }`}
          >
            IA
          </button>
        </div>

        {/* MODE PICKER */}
        {visualMode === "picker" && (
          <>
            <button
              className="bg-ratecard-green text-white px-4 py-2 rounded"
              onClick={() => setPickerOpen(true)}
            >
              Ouvrir bibliothèque
            </button>

            <MediaPicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              folders={["axes", "companies", "persons", "articles"]}
              onSelect={(item) => {
                setMediaRectangleId(item.media_rectangle_id);
                setMediaSquareId(item.media_square_id);

                setVisuelRectUrl(item.rectangle_url);
                setVisuelSquareUrl(item.square_url);

                setPickerOpen(false);
              }}
            />
          </>
        )}

        {/* MODE UPLOAD */}
        {visualMode === "upload" && (
          <ArticleImageUploader
            articleId={id}
            onUploadComplete={({ rectangle_url, square_url }) => {
              setVisuelRectUrl(rectangle_url);
              setVisuelSquareUrl(square_url);
              // IDs seront mis à jour automatiquement via le backend
            }}
          />
        )}

        {/* MODE IA */}
        {visualMode === "ia" && (
          <button
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
            disabled={loadingIA}
            onClick={generateIA}
          >
            {loadingIA ? "Génération…" : "Générer un visuel IA"}
          </button>
        )}

        {/* PREVIEW */}
        {visuelRectUrl && (
          <div className="mt-3">
            <img src={visuelRectUrl} className="w-80 border rounded" />
          </div>
        )}
      </div>

      {/* SAVE */}
      <button
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
        disabled={saving}
        onClick={update}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
