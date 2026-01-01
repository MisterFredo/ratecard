"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { api } from "@/lib/api";

import HtmlEditor from "@/components/admin/HtmlEditor";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesSelector from "@/components/admin/AxesSelector";
import ArticleVisualSelector from "@/components/admin/ArticleVisualSelector";

export default function EditArticlePage({ params }) {
  const { id } = params;

  // -------------------------------------------------------
  // STATES
  // -------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [resume, setResume] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [axes, setAxes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  // VISUELS (IDs et URLs)
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);

  const [visualUrls, setVisualUrls] = useState<{
    rectangle_url: string | null;
    square_url: string | null;
  }>({ rectangle_url: null, square_url: null });

  // -------------------------------------------------------
  // LOAD ARTICLE
  // -------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/articles/${id}`);
      const a = res.article;

      // CORE FIELDS
      setTitle(a.TITRE || "");
      setResume(a.RESUME || "");
      setContentHtml(a.CONTENU_HTML || "");

      // AXES enrichis
      setAxes(a.axes || []);

      // COMPANIES enrichies
      setCompanies(a.companies || []);

      // PERSONS enrichies
      setPersons(
        (a.persons || []).map((p: any) => ({
          id_person: p.ID_PERSON,
          name: p.NAME,
          role: p.ROLE || "",
        }))
      );

      // VISUELS
      setMediaRectangleId(a.MEDIA_RECTANGLE_ID || null);
      setMediaSquareId(a.MEDIA_SQUARE_ID || null);

      setVisualUrls({
        rectangle_url: a.media_rectangle_path
          ? `${process.env.NEXT_PUBLIC_GCS_BASE_URL}/${a.media_rectangle_path}`
          : null,
        square_url: a.media_square_path
          ? `${process.env.NEXT_PUBLIC_GCS_BASE_URL}/${a.media_square_path}`
          : null,
      });

      setLoading(false);
    }

    load();
  }, [id]);

  // -------------------------------------------------------
  // SAVE ARTICLE
  // -------------------------------------------------------
  async function save() {
    if (!title.trim()) {
      alert("Merci de renseigner un titre");
      return;
    }

    setSaving(true);

    const payload = {
      titre: title,
      resume,
      contenu_html: contentHtml,

      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,

      axes: axes.map((ax) => ax.ID_AXE || ax.id_axe),
      companies: companies.map((c) => c.ID_COMPANY || c.id_company),
      persons: persons.map((p) => ({
        id_person: p.id_person,
        role: p.role || null,
      })),

      auteur: null,
    };

    const res = await api.put(`/articles/update/${id}`, payload);

    setSaving(false);
    alert("Article mis à jour !");
  }

  if (loading) return <div>Chargement…</div>;

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier l’article
        </h1>

        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* TITRE */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* RESUME */}
      <textarea
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        className="border p-2 w-full h-24 rounded"
      />

      {/* CONTENU */}
      <HtmlEditor value={contentHtml} onChange={setContentHtml} />

      {/* AXES, COMPANIES, PERSONS */}
      <AxesSelector values={axes} onChange={setAxes} />
      <CompanySelector values={companies} onChange={setCompanies} />
      <PersonSelector values={persons} onChange={setPersons} />

      {/* VISUEL */}
      <ArticleVisualSelector
        articleId={id}
        title={title}
        axes={axes}
        companies={companies}
        initialRectangleUrl={visualUrls.rectangle_url}
        initialSquareUrl={visualUrls.square_url}
        onChange={({ rectangle_url, square_url, rectangle_id, square_id }) => {
          setVisualUrls({
            rectangle_url,
            square_url,
          });
          setMediaRectangleId(rectangle_id);
          setMediaSquareId(square_id);
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
