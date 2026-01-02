"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// Sélecteurs
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import TopicSelector from "@/components/admin/TopicSelector";
import HtmlEditor from "@/components/admin/HtmlEditor";

// Visuel Article (V2)
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const { id: articleId } = params;

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* CONTENU */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [intro, setIntro] = useState("");
  const [outro, setOutro] = useState("");

  /* RELATIONS */
  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  /* META */
  const [author, setAuthor] = useState("");

  /* ---------------------------------------------------------
     LOAD ARTICLE
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    try {
      const res = await api.get(`/articles/${articleId}`);
      const a = res.article;

      // CONTENU
      setTitle(a.TITLE || "");
      setExcerpt(a.EXCERPT || "");
      setContentHtml(a.CONTENT_HTML || "");
      setIntro(a.INTRO || "");
      setOutro(a.OUTRO || "");
      setAuthor(a.AUTHOR || "");

      // TOPICS
      if (a.topics) {
        setTopics(
          a.topics.map((t: any) => ({
            id_topic: t.ID_TOPIC,
            label: t.LABEL,
          }))
        );
      }

      // COMPANIES
      if (a.companies) {
        setCompanies(
          a.companies.map((c: any) => ({
            id_company: c.ID_COMPANY,
            name: c.NAME,
          }))
        );
      }

      // PERSONS
      if (a.persons) {
        setPersons(
          a.persons.map((p: any) => ({
            id_person: p.ID_PERSON,
            name: p.NAME,
            role: p.ROLE || "contributeur",
          }))
        );
      }
    } catch (e) {
      console.error(e);
      alert("Erreur chargement article");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [articleId]);

  /* ---------------------------------------------------------
     UPDATE ARTICLE — remplacement complet
  --------------------------------------------------------- */
  async function save() {
    if (!title.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    if (!contentHtml.trim()) {
      alert("Le contenu est obligatoire");
      return;
    }

    if (!topics || topics.length === 0) {
      alert("Au moins un topic est obligatoire");
      return;
    }

    setSaving(true);

    const payload = {
      title,
      content_html: contentHtml,
      excerpt: excerpt || null,
      intro: intro || null,
      outro: outro || null,
      author: author || null,

      topics: topics.map((t) => t.id_topic),
      companies: companies.map((c) => c.id_company),
      persons: persons.map((p) => ({
        id_person: p.id_person,
        role: p.role || "contributeur",
      })),
    };

    try {
      await api.put(`/articles/update/${articleId}`, payload);
      alert("Article mis à jour");
    } catch (e) {
      console.error(e);
      alert("Erreur mise à jour article");
    }

    setSaving(false);
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

        <div className="space-x-4">
          <Link
            href={`/admin/articles/preview/${articleId}`}
            className="underline text-gray-600"
          >
            Aperçu
          </Link>

          <Link
            href="/admin/articles"
            className="underline text-gray-600"
          >
            ← Retour
          </Link>
        </div>
      </div>

      {/* -------------------------------
          SECTION A — CONTENU
      -------------------------------- */}
      <section className="space-y-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="border p-2 w-full rounded"
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Accroche / résumé (excerpt)"
          className="border p-2 w-full h-24 rounded"
        />

        <HtmlEditor value={contentHtml} onChange={setContentHtml} />

        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="Intro (idée forte)"
          className="border p-2 w-full h-20 rounded"
        />

        <textarea
          value={outro}
          onChange={(e) => setOutro(e.target.value)}
          placeholder="Outro (ce qu’il faut retenir)"
          className="border p-2 w-full h-20 rounded"
        />
      </section>

      {/* -------------------------------
          SECTION B — ENTITÉS
      -------------------------------- */}
      <section className="space-y-6">
        <TopicSelector values={topics} onChange={setTopics} />
        <CompanySelector values={companies} onChange={setCompanies} />
        <PersonSelector values={persons} onChange={setPersons} />
      </section>

      {/* -------------------------------
          SECTION C — MÉTA
      -------------------------------- */}
      <section className="space-y-4">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Auteur (optionnel)"
          className="border p-2 w-full rounded"
        />
      </section>

      {/* -------------------------------
          ACTION SAVE
      -------------------------------- */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* -------------------------------
          SECTION D — VISUEL ARTICLE
      -------------------------------- */}
      <ArticleVisualSection
        articleId={articleId}
        title={title}
        excerpt={excerpt}
        topics={topics}
      />
    </div>
  );
}
