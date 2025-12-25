// frontend/app/admin/articles/edit/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";

export default function EditArticlePage({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPersons, setSelectedPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]);

  const [visuelUrl, setVisuelUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number | undefined>();

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any>(null);


  // ============================================================
  //  LOAD ARTICLE
  // ============================================================
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/articles/${id}`);
      const a = res.article;

      if (a) {
        setTitle(a.TITRE || "");
        setExcerpt(a.EXCERPT || "");
        setContentHtml(a.CONTENU_HTML || "");

        setVisuelUrl(a.VISUEL_URL || "");
        setIsFeatured(a.IS_FEATURED || false);
        setFeaturedOrder(a.FEATURED_ORDER || undefined);

        // COMPANY
        if (a.companies && a.companies.length > 0) {
          setSelectedCompany(a.companies[0]);
        }

        // PERSONS
        if (a.persons) {
          setSelectedPersons(a.persons.map((p) => p.ID_PERSON));
        }

        // AXES (mapping objects)
        if (a.axes) {
          setAxes(
            a.axes.map((ax) => ({
              TYPE: ax.AXE_TYPE,
              LABEL: ax.AXE_VALUE,
              ID_AXE: null
            }))
          );
        }
      }

      setLoading(false);
    }

    load();
  }, [id]);


  // ============================================================
  //   SAVE ARTICLE
  // ============================================================
  async function saveArticle() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt: excerpt,
      contenu_html: contentHtml,
      visuel_url: visuelUrl || null,
      auteur: null,

      is_featured: isFeatured,
      featured_order: featuredOrder || null,

      axes: axes.map((a) => ({
        type: a.TYPE,
        value: a.LABEL
      })),

      companies: selectedCompany ? [selectedCompany] : [],

      persons: selectedPersons.map((id) => ({
        id_person: id,
        role: null
      })),
    };

    const res = await api.put(`/articles/update/${id}`, payload);
    setSaveResult(res);
    setSaving(false);
  }


  if (loading) return <div>Chargement…</div>;


  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Modifier l’article</h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>


      {/* TITRE */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full"
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

      {/* PERSON */}
      <PersonSelector values={selectedPersons} onChange={setSelectedPersons} />

      {/* AXES */}
      <AxesEditor values={axes} onChange={setAxes} />


      {/* VISUEL */}
      <input
        value={visuelUrl}
        onChange={(e) => setVisuelUrl(e.target.value)}
        placeholder="Visuel (URL)"
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


      <button
        onClick={saveArticle}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>


      {saveResult && (
        <pre className="bg-gray-100 p-4 mt-4 rounded">
          {JSON.stringify(saveResult, null, 2)}
        </pre>
      )}

    </div>
  );
}
