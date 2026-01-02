"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// Sélecteurs
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import TopicSelector from "@/components/admin/TopicSelector";
import HtmlEditor from "@/components/admin/HtmlEditor";

// Visuel Article (V2)
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

export default function CreateArticlePage() {
  /* ---------------------------------------------------------
     CORE FIELDS (DRAFT LOCAL)
  --------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [intro, setIntro] = useState("");
  const [outro, setOutro] = useState("");

  /* ---------------------------------------------------------
     RELATIONS
  --------------------------------------------------------- */
  const [topics, setTopics] = useState<any[]>([]);     // obligatoire (>=1)
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  /* ---------------------------------------------------------
     META
  --------------------------------------------------------- */
  const [author, setAuthor] = useState("");

  /* ---------------------------------------------------------
     ARTICLE STATE
  --------------------------------------------------------- */
  const [saving, setSaving] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);

  /* ---------------------------------------------------------
     CREATE ARTICLE (validation du draft)
  --------------------------------------------------------- */
  async function createArticle() {
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
      const res = await api.post("/articles/create", payload);
      setArticleId(res.id_article);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la création de l’article");
    }

    setSaving(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Créer un article
        </h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* -------------------------------
          SECTION A — CONTENU
      -------------------------------- */}
      <section className="space-y-6">
        <input
          value={title}
          placeholder="Titre de l’article"
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <textarea
          value={excerpt}
          placeholder="Accroche / résumé (excerpt)"
          onChange={(e) => setExcerpt(e.target.value)}
          className="border p-2 w-full h-24 rounded"
        />

        <HtmlEditor value={contentHtml} onChange={setContentHtml} />

        <textarea
          value={intro}
          placeholder="Intro (idée forte)"
          onChange={(e) => setIntro(e.target.value)}
          className="border p-2 w-full h-20 rounded"
        />

        <textarea
          value={outro}
          placeholder="Outro (ce qu’il faut retenir)"
          onChange={(e) => setOutro(e.target.value)}
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
          placeholder="Auteur (optionnel)"
          onChange={(e) => setAuthor(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </section>

      {/* -------------------------------
          ACTION CREATE
      -------------------------------- */}
      {!articleId && (
        <button
          onClick={createArticle}
          disabled={saving}
          className="bg-ratecard-blue text-white px-6 py-2 rounded"
        >
          {saving ? "Création…" : "Valider le draft"}
        </button>
      )}

      {/* -------------------------------
          SECTION D — VISUEL ARTICLE
          (après création uniquement)
      -------------------------------- */}
      {articleId && (
        <ArticleVisualSection
          articleId={articleId}
          title={title}
          excerpt={excerpt}
          topics={topics}
        />
      )}
    </div>
  );
}
