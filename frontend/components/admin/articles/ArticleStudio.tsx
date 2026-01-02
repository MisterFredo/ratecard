"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Blocs Studio
import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";
import ArticleContentBlock from "@/components/admin/articles/ArticleContentBlock";
import ArticleContextBlock from "@/components/admin/articles/ArticleContextBlock";
import ArticleVariantsBlock from "@/components/admin/articles/ArticleVariantsBlock";
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

type Mode = "create" | "edit";

type ArticleStudioProps = {
  mode: Mode;
  articleId?: string;
};

export default function ArticleStudio({ mode, articleId }: ArticleStudioProps) {
  /* ---------------------------------------------------------
     STATE ARTICLE (DRAFT LOCAL / ÉDITION)
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
     IA SOURCE PANEL (ACCORDÉON)
  --------------------------------------------------------- */
  const [showSourcePanel, setShowSourcePanel] = useState(false);

  /* ---------------------------------------------------------
     PERSISTENCE
  --------------------------------------------------------- */
  const [saving, setSaving] = useState(false);
  const [internalArticleId, setInternalArticleId] = useState<string | null>(
    articleId || null
  );

  /* ---------------------------------------------------------
     LOAD ARTICLE (MODE EDIT)
  --------------------------------------------------------- */
  useEffect(() => {
    if (mode !== "edit" || !articleId) return;

    async function load() {
      try {
        const res = await api.get(`/articles/${articleId}`);
        const a = res.article;

        setTitle(a.TITLE || "");
        setExcerpt(a.EXCERPT || "");
        setContentHtml(a.CONTENT_HTML || "");

        setIntro(a.INTRO || "");
        setOutro(a.OUTRO || "");

        setLinkedinPostText(a.LINKEDIN_POST_TEXT || "");
        setCarouselCaption(a.CAROUSEL_CAPTION || "");

        setAuthor(a.AUTHOR || "");

        setTopics(
          (a.topics || []).map((t: any) => ({
            id_topic: t.ID_TOPIC,
            label: t.LABEL,
          }))
        );

        setCompanies(
          (a.companies || []).map((c: any) => ({
            id_company: c.ID_COMPANY,
            name: c.NAME,
          }))
        );

        setPersons(
          (a.persons || []).map((p: any) => ({
            id_person: p.ID_PERSON,
            name: p.NAME,
            role: p.ROLE || "contributeur",
          }))
        );

        setInternalArticleId(articleId);
      } catch (e) {
        console.error(e);
        alert("Erreur chargement article");
      }
    }

    load();
  }, [mode, articleId]);

  /* ---------------------------------------------------------
     VALIDATION / SAUVEGARDE
  --------------------------------------------------------- */
  async function saveArticle() {
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
      if (mode === "create") {
        const res = await api.post("/articles/create", payload);
        setInternalArticleId(res.id_article);
      } else if (mode === "edit" && internalArticleId) {
        await api.put(`/articles/update/${internalArticleId}`, payload);
        alert("Article mis à jour");
      }
    } catch (e: any) {
      alert(e.message || "Erreur sauvegarde article");
    }

    setSaving(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* -------------------------------------------------
         ACCORDÉON IA — SOURCE → ARTICLE
      ------------------------------------------------- */}
      {mode === "create" && !internalArticleId && (
        <div className="border rounded bg-white">
          <button
            onClick={() => setShowSourcePanel(!showSourcePanel)}
            className="w-full flex justify-between items-center px-4 py-3 border-b"
          >
            <h2 className="text-lg font-semibold text-ratecard-blue">
              Transformer une source (IA)
            </h2>
            <span className="text-sm text-gray-500">
              {showSourcePanel ? "Masquer" : "Afficher"}
            </span>
          </button>

          {showSourcePanel && (
            <div className="p-4">
              <ArticleSourcePanel
                onApplyDraft={(draft) => {
                  if (draft.title) setTitle(draft.title);
                  if (draft.excerpt) setExcerpt(draft.excerpt);
                  if (draft.content_html)
                    setContentHtml(draft.content_html);
                  if (draft.intro) setIntro(draft.intro);
                }}
              />
            </div>
          )}
        </div>
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
          if (data.contentHtml !== undefined)
            setContentHtml(data.contentHtml);
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
         ACTION PRINCIPALE
      ------------------------------------------------- */}
      <button
        onClick={saveArticle}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving
          ? "Enregistrement…"
          : mode === "create"
          ? "Valider le draft"
          : "Enregistrer"}
      </button>

      {/* -------------------------------------------------
         VISUEL ARTICLE (APRÈS CRÉATION)
      ------------------------------------------------- */}
      {internalArticleId && (
        <ArticleVisualSection
          articleId={internalArticleId}
          title={title}
          excerpt={excerpt}
          topics={topics}
        />
      )}
    </div>
  );
}
