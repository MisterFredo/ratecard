"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanyMultiSelector from "@/components/admin/CompanyMultiSelector";
import PersonMultiSelector from "@/components/admin/PersonMultiSelector";
import AxeMultiSelector from "@/components/admin/AxeMultiSelector";

import ArticleEditVisualSection from "./VisualSection";

export default function EditArticlePage({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FIELDS
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  // ENTITIES
  const [companies, setCompanies] = useState<string[]>([]);
  const [persons, setPersons] = useState<string[]>([]);
  const [axes, setAxes] = useState<string[]>([]);

  // VISUELS
  const [rectangleId, setRectangleId] = useState<string | null>(null);
  const [squareId, setSquareId] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD ARTICLE
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/articles/${id}`);
      const a = res.article;

      // FIELDS
      setTitle(a.TITRE || "");
      setExcerpt(a.EXCERPT || "");
      setContentHtml(a.CONTENU_HTML || "");

      // ENTITIES
      setCompanies(a.companies || []);
      setPersons((a.persons || []).map((p) => p.ID_PERSON));
      setAxes((a.axes || []).map((ax) => ax.AXE_VALUE));

      // VISUELS stockés en base
      if (a.VISUEL_RECTANGLE_ID) setRectangleId(a.VISUEL_RECTANGLE_ID);
      if (a.VISUEL_SQUARE_ID) setSquareId(a.VISUEL_SQUARE_ID);

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     SAVE ARTICLE
  --------------------------------------------------------- */
  async function save() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt,
      contenu_html: contentHtml,

      // Nouvelles colonnes
      media_rectangle_id: rectangleId,
      media_square_id: squareId,

      companies,
      persons,
      axes,
    };

    const res = await api.put(`/articles/update/${id}`, payload);

    setSaving(false);
    alert("Article mis à jour !");
  }

  if (loading) return <div>Chargement…</div>;

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
        <Link href="/admin/articles" className="underline text-gray-500">
          ← Retour
        </Link>
      </div>

      {/* TITRE */}
      <input
        className="border p-2 w-full rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* EXCERPT */}
      <textarea
        className="border p-2 w-full rounded h-24"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />

      {/* CONTENU HTML */}
      <textarea
        className="border p-2 w-full rounded h-72 font-mono text-sm"
        value={contentHtml}
        onChange={(e) => setContentHtml(e.target.value)}
      />

      {/* ENTITÉS MULTI */}
      <CompanyMultiSelector
        values={companies}
        onChange={setCompanies}
      />

      <PersonMultiSelector
        values={persons}
        onChange={setPersons}
      />

      <AxeMultiSelector
        values={axes}
        onChange={setAxes}
      />

      {/* VISUELS */}
      <ArticleEditVisualSection
        id_article={id}
        axes={axes}
        companies={companies}
        title={title}
        excerpt={excerpt}
        rectangleId={rectangleId}
        squareId={squareId}
        onChangeRectangle={setRectangleId}
        onChangeSquare={setSquareId}
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
