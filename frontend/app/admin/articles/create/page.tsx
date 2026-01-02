"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// Blocs Studio (à brancher ensuite)
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

// À venir (fichiers suivants)
// import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";
// import ArticleContentBlock from "@/components/admin/articles/ArticleContentBlock";
// import ArticleContextBlock from "@/components/admin/articles/ArticleContextBlock";
// import ArticleVariantsBlock from "@/components/admin/articles/ArticleVariantsBlock";

type Mode = "scratch" | "source";

export default function CreateArticleStudioPage() {
  /* ---------------------------------------------------------
     MODE STUDIO
  --------------------------------------------------------- */
  const [mode, setMode] = useState<Mode>("scratch");

  /* ---------------------------------------------------------
     STATE ARTICLE (DRAFT LOCAL)
  --------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [intro, setIntro] = useState("");
  const [outro, setOutro] = useState("");

  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  const [author, setAuthor] = useState("");

  /* ---------------------------------------------------------
     ARTICLE PERSISTÉ
  --------------------------------------------------------- */
  const [articleId, setArticleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---------------------------------------------------------
     CREATE ARTICLE (VALIDATION DU DRAFT)
  --------------------------------------------------------- */
  async function validateDraft() {
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
    } catch (e: any) {
      alert(e.message || "Erreur création article");
    }

    setSaving(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Article Studio
        </h1>

        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* -------------------------------------------------
         MODE SELECTOR
      ------------------------------------------------- */}
      {!articleId && (
        <div className="flex gap-4 border-b pb-3">
          <button
            onClick={() => setMode("scratch")}
            className={`px-4 py-2 rounded ${
              mode === "scratch"
                ? "bg-ratecard-blue text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Rédiger un article
          </button>

          <button
            onClick={() => setMode("source")}
            className={`px-4 py-2 rounded ${
              mode === "source"
                ? "bg-ratecard-blue text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Transformer une source (IA)
          </button>
        </div>
      )}

      {/* -------------------------------------------------
         MODE SOURCE (à brancher)
      ------------------------------------------------- */}
      {mode === "source" && !articleId && (
        <div className="border rounded p-4 bg-white text-gray-500">
          Mode “Transformer une source” — composant à venir
        </div>
      )}

      {/* -------------------------------------------------
         CONTENU PRINCIPAL (temporaire inline)
         → sera extrait dans ArticleContentBlock
      ------------------------------------------------- */}
      <div className="space-y-4 border rounded p-4 bg-white">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l’article"
          className="border p-2 w-full rounded"
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Accroche / résumé"
          className="border p-2 w-full h-20 rounded"
        />

        {/* HtmlEditor branché ensuite */}
        <textarea
          value={contentHtml}
          onChange={(e) => setContentHtml(e.target.value)}
          placeholder="Contenu de l’article"
          className="border p-2 w-full h-40 rounded"
        />
      </div>

      {/* -------------------------------------------------
         CONTEXTE ÉDITORIAL (temporaire)
         → sera extrait dans ArticleContextBlock
      ------------------------------------------------- */}
      <div className="border rounded p-4 bg-white text-gray-500">
        Sélection Topics / Sociétés / Personnes — composant à venir
      </div>

      {/* -------------------------------------------------
         ACTION VALIDATION
      ------------------------------------------------- */}
      {!articleId && (
        <button
          onClick={validateDraft}
          disabled={saving}
          className="bg-ratecard-blue text-white px-6 py-2 rounded"
        >
          {saving ? "Création…" : "Valider le draft"}
        </button>
      )}

      {/* -------------------------------------------------
         VISUEL ARTICLE (APRÈS CRÉATION)
      ------------------------------------------------- */}
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
