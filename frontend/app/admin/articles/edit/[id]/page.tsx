"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import HtmlEditor from "@/components/admin/HtmlEditor";
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditArticlePage({ params }) {
  const { id } = params;

  /* ---------------------------------------------------------
     STATE ARTICLE
  --------------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* CORE FIELDS */
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  /* ENTITÉS */
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]);

  /* VISUELS */
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);
  const [previewRectUrl, setPreviewRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD ARTICLE
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    const res = await api.get(`/articles/${id}`);
    if (!res || !res.article) {
      setError("Article introuvable");
      return;
    }

    const a = res.article;

    /* CORE */
    setTitle(a.TITRE || "");
    setResume(a.RESUME || "");
    setContentHtml(a.CONTENU_HTML || "");

    /* AXES */
    if (a.axes) {
      setAxes(a.axes.map((ax: any) => ({
        id_axe: ax.ID_AXE,
        LABEL: ax.LABEL
      })));
    }

    /* COMPANIES */
    if (a.companies) {
      setCompanies(
        a.companies.map((c: any) => ({
          id_company: c.ID_COMPANY,
          name: c.NAME
        }))
      );
    }

    /* PERSONS */
    if (a.persons) {
      setPersons(
        a.persons.map((p: any) => ({
          id_person: p.ID_PERSON,
          name: p.NAME,
          role: p.ROLE || "contributeur"
        }))
      );
    }

    /* VISUELS */
    setMediaRectangleId(a.MEDIA_RECTANGLE_ID || null);
    setMediaSquareId(a.MEDIA_SQUARE_ID || null);

    if (a.media_rectangle_path) {
      setPreviewRectUrl(`${GCS_BASE_URL}/${a.media_rectangle_path}`);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <div>Chargement…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  /* ---------------------------------------------------------
     UPDATE ARTICLE
  --------------------------------------------------------- */
  async function save() {
    if (!title.trim()) return alert("Titre obligatoire");

    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,

      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,

      auteur: null, // pas encore géré

      axes: axes.map((ax: any) => ax.id_axe),
      companies: companies.map((c) => c.id_company),
      persons: persons.map((p) => ({ id_person: p.id_person, role: p.role })),
    };

    const response = await api.put(`/articles/update/${id}`, payload);

    if (response.status !== "ok") {
      alert("Erreur sauvegarde article");
      console.error(response);
    }

    setSaving(false);
    alert("Article mis à jour !");
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier l’article
        </h1>

        <div className="space-x-3">
          <Link 
            href={`/admin/articles/preview/${id}`}
            className="text-gray-600 underline"
          >
            Aperçu
          </Link>

          <Link 
            href="/admin/articles"
            className="text-gray-600 underline"
          >
            ← Retour
          </Link>
        </div>
      </div>

      {/* TITRE */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="border p-2 w-full rounded"
      />

      {/* RESUME */}
      <textarea
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        placeholder="Résumé"
        className="border p-2 w-full h-24 rounded"
      />

      {/* CONTENU */}
      <HtmlEditor value={contentHtml} onChange={setContentHtml} />

      {/* ENTITÉS */}
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

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
