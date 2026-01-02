"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// Blocs Studio
import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";
import ArticleContentBlock from "@/components/admin/articles/ArticleContentBlock";
import ArticleContextBlock from "@/components/admin/articles/ArticleContextBlock";
import ArticleVariantsBlock from "@/components/admin/articles/ArticleVariantsBlock";
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

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

  const [linkedinPostText, setLinkedinPostText] = useState("");
  const [carouselCaption, setCarouselCaption] = useState("");

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
     VALIDATION DU DRAFT → CREATE ARTICLE
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
      linkedin_post_text: linkedinPostText || null,
      carousel_caption: carouselCaption || null,
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
         MODE SOURCE → ARTICLE
      ------------------------------------------------- */}
      {mode === "source" && !articleId && (
        <ArticleSourcePanel
          onApplyDraft={(draft) => {
            if (draft.title) setTitle(draft.title);
            if (draft.excerpt) setExcerpt(draft.excerpt);
            if (draft.content_html) setContentHtml(draft.content_html);
            if (draft.intro) setIntro(draft.intro);
          }}
        />
      )}

      {/* -------------------------------------------------
         CONTENU PRINCIPAL
      ------------------------------------------------- */}
      <ArticleContentBlock
        title={title}
        excerpt={excerpt}
        contentHtml={contentHtml}
        onChange={(data) => {
          if (data.title !== undefined) setTitle(data.title);
          if (data.excerpt !== undefined) setExcerpt(data.excerpt);
          if (data.contentHtml !== undefined) setContentHtml(data.contentHtml);
        }}
      />

      {/* -------------------------------------------------
         CONTEXTE ÉDITORIAL
      ------------------------------------------------- */}
      <ArticleContextBlock
        topics={topics}
        companies={companies}
        persons={persons}
        onChange={(data) => {
          if (data.topics) setTopics(data.topics);
          if (data.companies) setCompanies(data.companies);
          if (data.persons) setPersons(data.persons);
        }}
      />

      {/* -------------------------------------------------
         VARIANTES ÉDITORIALES
      ------------------------------------------------- */}
      <ArticleVariantsBlock
        intro={intro}
        outro={outro}
        linkedinPostText={linkedinPostText}
        carouselCaption={carouselCaption}
        onChange={(data) => {
          if (data.intro !== undefined) setIntro(data.intro);
          if (data.outro !== undefined) setOutro(data.outro);
          if (data.linkedinPostText !== undefined)
            setLinkedinPostText(data.linkedinPostText);
          if (data.carouselCaption !== undefined)
            setCarouselCaption(data.carouselCaption);
        }}
      />

      {/* -------------------------------------------------
         ACTION CREATE
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
