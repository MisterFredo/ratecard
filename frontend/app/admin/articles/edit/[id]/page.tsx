// frontend/app/admin/articles/edit/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import Link from "next/link";

export default function EditArticlePage({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);

  // Article state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [company, setCompany] = useState("");
  const [persons, setPersons] = useState<string[]>([]);
  const [axes, setAxes] = useState<string[]>([]);

  const [visuelUrl, setVisuelUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number | undefined>();

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any>(null);


  // ============================================================
  // 📌 LOAD ARTICLE
  // ============================================================
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get(`/articles/${id}`);
      const article = res.article;

      if (article) {
        setTitle(article.TITRE || "");
        setExcerpt(article.EXCERPT || "");
        setContentHtml(article.CONTENU_HTML || "");

        setVisuelUrl(article.VISUEL_URL || "");

        setIsFeatured(article.IS_FEATURED || false);
        setFeaturedOrder(article.FEATURED_ORDER || undefined);

        // company
        if (article.companies && article.companies.length > 0) {
          setCompany(article.companies[0]);
        }

        // persons
        if (article.persons) {
          setPersons(article.persons.map((p) => p.ID_PERSON));
        }

        // axes
        if (article.axes) {
          setAxes(article.axes.map((a) => a.AXE_VALUE));
        }
      }

      setLoading(false);
    }

    load();
  }, [id]);


  // ============================================================
  // 📌 SAVE ARTICLE
  // ============================================================
  async function saveArticle() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt: excerpt,
      contenu_html: contentHtml,
      visuel_url: visuelUrl || null,
      auteur: null, // l’auteur n’est pas modifiable pour l’instant
      is_featured: isFeatured,
      featured_order: featuredOrder || null,
      axes: axes.map((tag) => ({ type: "TOPIC", value: tag })),
      companies: company ? [company] : [],
      persons: persons.map((id) => ({ id_person: id, role: null })),
    };

    const res = await api.put(`/articles/update/${id}`, payload);
    setSaveResult(res);
    setSaving(false);
  }


  if (loading) {
    return <div>Chargement…</div>;
  }


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
      <CompanySelector value={company} onChange={setCompany} />

      {/* PERSONS */}
      <PersonSelector values={persons} onChange={setPersons} />

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
