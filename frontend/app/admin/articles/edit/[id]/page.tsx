"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";
import HtmlEditor from "@/components/admin/HtmlEditor";

export default function EditArticle({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPersons, setSelectedPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]);

  const [visuelUrl, setVisuelUrl] = useState("");
  const [visuelSquare, setVisuelSquare] = useState("");

  const [pickerVisuelOpen, setPickerVisuelOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  // ================================================================
  // LOAD ARTICLE DATA
  // ================================================================
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get(`/articles/${id}`);
      const a = res.article;

      setTitle(a.TITRE || "");
      setExcerpt(a.EXCERPT || "");
      setContentHtml(a.CONTENU_HTML || "");

      setVisuelUrl(a.VISUEL_URL || "");
      setVisuelSquare(a.VISUEL_SQUARE_URL || "");

      setSelectedCompany(a.companies?.[0] || "");
      setSelectedPersons(a.persons?.map((p) => p.ID_PERSON) || []);

      setAxes(
        (a.axes || []).map((ax: any) => ({
          TYPE: ax.AXE_TYPE,
          LABEL: ax.AXE_VALUE,
        }))
      );

      setLoading(false);
    }

    load();
  }, [id]);

  // ================================================================
  // GENERATE IA VISUAL (coming next)
  // ================================================================
  async function generateIA() {
    if (!title && !excerpt) {
      return alert("Merci de renseigner un titre ou un résumé");
    }

    setSaving(true);

    const payload = {
      title,
      excerpt,
      axes: axes.map((a) => a.LABEL),
      company: selectedCompany || null,
    };

    const res = await api.post("/media/generate", payload);

    if (res.status === "ok") {
      setVisuelUrl(res.urls.rectangle);
      setVisuelSquare(res.urls.square);
    }

    setSaving(false);
  }

  // ================================================================
  // SAVE ARTICLE
  // ================================================================
  async function save() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt: excerpt,
      contenu_html: contentHtml,
      visuel_url: visuelUrl || null,
      visuel_square_url: visuelSquare || null,
      is_featured: false,
      featured_order: null,
      axes: axes.map((a) => ({ type: a.TYPE, value: a.LABEL })),
      companies: selectedCompany ? [selectedCompany] : [],
      persons: selectedPersons.map((id) => ({ id_person: id, role: null })),
      auteur: null,
    };

    const res = await api.put(`/articles/update/${id}`, payload);
    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

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

      {/* EXCERPT */}
      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        className="border p-2 w-full rounded h-24"
      />

      {/* CONTENU */}
      <HtmlEditor value={contentHtml} onChange={setContentHtml} />

      {/* COMPANY */}
      <CompanySelector value={selectedCompany} onChange={setSelectedCompany} />

      {/* PERSONS */}
      <PersonSelector values={selectedPersons} onChange={setSelectedPersons} />

      {/* AXES */}
      <AxesEditor values={axes} onChange={setAxes} />

      {/* ======================================================= */}
      {/* VISUELS */}
      {/* ======================================================= */}
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
          <div className="mt-2">
            <img
              src={visuelUrl}
              className="w-80 border rounded bg-white"
            />
            <p className="text-xs text-gray-500 break-all mt-1">{visuelUrl}</p>
          </div>
        )}
      </div>

      {/* PICKER */}
      <MediaPicker
        open={pickerVisuelOpen}
        onClose={() => setPickerVisuelOpen(false)}
        category="articles"
        onSelect={(url) => setVisuelUrl(url)}
      />

      {/* UPLOADER */}
      {uploaderOpen && (
        <div className="border p-4 rounded bg-white">
          <MediaUploader
            onUploadComplete={(urls) => {
              setVisuelUrl(urls.rectangle.url);
              setVisuelSquare(urls.square.url);
              setUploaderOpen(false);
            }}
          />
        </div>
      )}

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
