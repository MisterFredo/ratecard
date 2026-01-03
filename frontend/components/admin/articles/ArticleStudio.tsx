"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Blocs
import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";
import ArticleContentBlock from "@/components/admin/articles/ArticleContentBlock";
import ArticleContextBlock from "@/components/admin/articles/ArticleContextBlock";
import ArticleVariantsBlock from "@/components/admin/articles/ArticleVariantsBlock";
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

type Mode = "create" | "edit";

type Step =
  | "CONTEXT"
  | "START_MODE"
  | "CONTENT"
  | "VARIANTS"
  | "VISUAL";

type Props = {
  mode: Mode;
  articleId?: string;
};

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function ArticleStudio({ mode, articleId }: Props) {
  /* =========================================================
     ÉTAT — CONTEXTE D’INTENTION (FIGÉ APRÈS VALIDATION)
  ========================================================= */
  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [contextValidated, setContextValidated] = useState(false);

  /* =========================================================
     ÉTAT — MODE DE DÉMARRAGE
  ========================================================= */
  const [startMode, setStartMode] = useState<"MANUAL" | "SOURCE" | null>(null);

  /* =========================================================
     ÉTAT — CONTENU ÉDITORIAL
  ========================================================= */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  /* =========================================================
     ÉTAT — VARIANTES
  ========================================================= */
  const [intro, setIntro] = useState("");
  const [outro, setOutro] = useState("");
  const [linkedinPostText, setLinkedinPostText] = useState("");
  const [carouselCaption, setCarouselCaption] = useState("");

  /* =========================================================
     ÉTAT — VISUELS
  ========================================================= */
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* =========================================================
     ÉTAT — MÉTA / PERSISTENCE
  ========================================================= */
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [internalArticleId, setInternalArticleId] = useState<string | null>(
    articleId || null
  );

  const [step, setStep] = useState<Step>("CONTEXT");

  /* =========================================================
     LOAD ARTICLE (MODE EDIT)
  ========================================================= */
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

        setSquareUrl(
          a.MEDIA_SQUARE_ID
            ? `${GCS}/articles/${a.MEDIA_SQUARE_ID}`
            : null
        );

        setRectUrl(
          a.MEDIA_RECTANGLE_ID
            ? `${GCS}/articles/${a.MEDIA_RECTANGLE_ID}`
            : null
        );

        setContextValidated(true);
        setStep("CONTENT");
        setInternalArticleId(articleId);
      } catch (e) {
        console.error(e);
        alert("Erreur chargement article");
      }
    }

    load();
  }, [mode, articleId]);

  /* =========================================================
     SAUVEGARDE ARTICLE (CREATE / UPDATE)
  ========================================================= */
  async function saveArticle() {
    if (!title.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    if (!contentHtml.trim()) {
      alert("Le contenu est obligatoire");
      return;
    }

    if (!topics.length) {
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
      if (!internalArticleId) {
        const res = await api.post("/articles/create", payload);
        setInternalArticleId(res.id_article);
      } else {
        await api.put(`/articles/update/${internalArticleId}`, payload);
      }

      setStep("VISUAL");
    } catch (e: any) {
      alert(e.message || "Erreur sauvegarde article");
    }

    setSaving(false);
  }

  /* =========================================================
     UI — ÉTAPES
  ========================================================= */
  return (
    <div className="space-y-8">

      {/* =========================
          ÉTAPE 1 — CONTEXTE
      ========================= */}
      {step === "CONTEXT" && (
        <>
          <h2 className="text-xl font-semibold text-ratecard-blue">
            1. Contexte d’intention
          </h2>

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

          <button
            onClick={() => {
              if (!topics.length) {
                alert("Au moins un topic est requis");
                return;
              }
              setContextValidated(true);
              setStep("START_MODE");
            }}
            className="bg-ratecard-blue text-white px-6 py-2 rounded"
          >
            Valider le contexte
          </button>
        </>
      )}

      {/* =========================
          ÉTAPE 2 — MODE DE DÉMARRAGE
      ========================= */}
      {step === "START_MODE" && contextValidated && (
        <>
          <h2 className="text-xl font-semibold text-ratecard-blue">
            2. Comment souhaitez-vous commencer ?
          </h2>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStartMode("MANUAL");
                setStep("CONTENT");
              }}
              className="px-4 py-2 border rounded"
            >
              Écrire manuellement
            </button>

            <button
              onClick={() => setStartMode("SOURCE")}
              className="px-4 py-2 bg-ratecard-blue text-white rounded"
            >
              Transformer une source (assistant)
            </button>
          </div>

          {startMode === "SOURCE" && (
            <ArticleSourcePanel
              onApplyDraft={(draft) => {
                if (draft.title) setTitle(draft.title);
                if (draft.excerpt) setExcerpt(draft.excerpt);
                if (draft.content_html) setContentHtml(draft.content_html);
                if (draft.intro) setIntro(draft.intro);
                setStep("CONTENT");
              }}
            />
          )}
        </>
      )}

      {/* =========================
          ÉTAPE 3 — CONTENU
      ========================= */}
      {step === "CONTENT" && (
        <>
          <h2 className="text-xl font-semibold text-ratecard-blue">
            3. Contenu éditorial
          </h2>

          <div className="text-sm text-gray-600">
            Topics : {topics.map((t) => t.label).join(", ")}
          </div>

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

          <button
            onClick={() => setStep("VARIANTS")}
            className="bg-ratecard-blue text-white px-6 py-2 rounded"
          >
            Continuer
          </button>
        </>
      )}

      {/* =========================
          ÉTAPE 4 — VARIANTES
      ========================= */}
      {step === "VARIANTS" && (
        <>
          <h2 className="text-xl font-semibold text-ratecard-blue">
            4. Variantes éditoriales
          </h2>

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

          <button
            onClick={saveArticle}
            disabled={saving}
            className="bg-ratecard-blue text-white px-6 py-2 rounded"
          >
            {saving ? "Enregistrement…" : "Valider l’article"}
          </button>
        </>
      )}

      {/* =========================
          ÉTAPE 5 — VISUEL
      ========================= */}
      {step === "VISUAL" && internalArticleId && (
        <>
          <h2 className="text-xl font-semibold text-ratecard-blue">
            5. Visuel
          </h2>

          <ArticleVisualSection
            articleId={internalArticleId}
            squareUrl={squareUrl}
            rectUrl={rectUrl}
            onUpdated={({ square, rectangle }) => {
              setSquareUrl(
                square
                  ? `${GCS}/articles/ARTICLE_${internalArticleId}_square.jpg`
                  : null
              );
              setRectUrl(
                rectangle
                  ? `${GCS}/articles/ARTICLE_${internalArticleId}_rect.jpg`
                  : null
              );
            }}
          />
        </>
      )}
    </div>
  );
}
