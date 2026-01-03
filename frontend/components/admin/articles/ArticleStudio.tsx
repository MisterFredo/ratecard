"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Steps
import StepContext from "@/components/admin/articles/steps/StepContext";
import StepSource from "@/components/admin/articles/steps/StepSource";
import StepContent from "@/components/admin/articles/steps/StepContent";
import StepVisual from "@/components/admin/articles/steps/StepVisual";
import StepPreview from "@/components/admin/articles/steps/StepPreview";
import StepPublish from "@/components/admin/articles/steps/StepPublish";

type Mode = "create" | "edit";
type Step =
  | "CONTEXT"
  | "SOURCE"
  | "CONTENT"
  | "VISUAL"
  | "PREVIEW"
  | "PUBLISH";

type Props = {
  mode: Mode;
  articleId?: string;
};

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function ArticleStudio({ mode, articleId }: Props) {
  /* =========================================================
     STATE — CONTEXTE
  ========================================================= */
  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [contextValidated, setContextValidated] = useState(false);

  /* =========================================================
     STATE — SOURCE
  ========================================================= */
  const [useSource, setUseSource] = useState<boolean | null>(null);

  /* =========================================================
     STATE — CONTENU
  ========================================================= */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [outro, setOutro] = useState("");

  /* =========================================================
     STATE — VISUEL
  ========================================================= */
  const [visualChoice, setVisualChoice] = useState<
    "TOPIC" | "COMPANY" | "PERSON" | "ARTICLE"
  >("ARTICLE");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* =========================================================
     STATE — PUBLICATION
  ========================================================= */
  const [publishMode, setPublishMode] = useState<"NOW" | "SCHEDULE">("NOW");
  const [publishAt, setPublishAt] = useState<string>("");

  /* =========================================================
     META
  ========================================================= */
  const [author, setAuthor] = useState("");
  const [internalArticleId, setInternalArticleId] = useState<string | null>(
    articleId || null
  );
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>("CONTEXT");

  /* =========================================================
     LOAD (EDIT MODE)
  ========================================================= */
  useEffect(() => {
    if (mode !== "edit" || !articleId) return;

    async function load() {
      const res = await api.get(`/articles/${articleId}`);
      const a = res.article;

      setTitle(a.TITLE || "");
      setExcerpt(a.EXCERPT || "");
      setContentHtml(a.CONTENT_HTML || "");
      setOutro(a.OUTRO || "");
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
        a.MEDIA_SQUARE_ID ? `${GCS}/articles/${a.MEDIA_SQUARE_ID}` : null
      );
      setRectUrl(
        a.MEDIA_RECTANGLE_ID ? `${GCS}/articles/${a.MEDIA_RECTANGLE_ID}` : null
      );

      setContextValidated(true);
      setInternalArticleId(articleId);
      setStep("CONTENT");
    }

    load();
  }, [mode, articleId]);

  /* =========================================================
     SAVE ARTICLE
  ========================================================= */
  async function saveArticle() {
    if (!title.trim()) return alert("Titre obligatoire");
    if (!contentHtml.trim()) return alert("Contenu obligatoire");
    if (!topics.length) return alert("Au moins un topic requis");

    setSaving(true);

    const payload = {
      title,
      content_html: contentHtml,
      excerpt: excerpt || null,
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
      if (!internalArticleId) {
        const res = await api.post("/articles/create", payload);
        setInternalArticleId(res.id_article);
      } else {
        await api.put(`/articles/update/${internalArticleId}`, payload);
      }
      setStep("VISUAL");
    } catch {
      alert("Erreur sauvegarde article");
    }

    setSaving(false);
  }

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div className="space-y-6">

      {/* STEP 1 — CONTEXTE */}
      <details open={step === "CONTEXT"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Contexte d’intention
        </summary>

        <StepContext
          topics={topics}
          companies={companies}
          persons={persons}
          contextValidated={contextValidated}
          onChange={(d) => {
            if (d.topics) setTopics(d.topics);
            if (d.companies) setCompanies(d.companies);
            if (d.persons) setPersons(d.persons);
          }}
          onValidate={() => {
            if (!topics.length) return alert("Topic requis");
            setContextValidated(true);
            setStep("SOURCE");
          }}
        />
      </details>

      {/* STEP 2 — SOURCE */}
      {contextValidated && (
        <details open={step === "SOURCE"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            2. Source
          </summary>

          <StepSource
            useSource={useSource}
            onChooseManual={() => {
              setUseSource(false);
              setStep("CONTENT");
            }}
            onChooseSource={() => setUseSource(true)}
            onApplyDraft={(draft) => {
              if (draft.title) setTitle(draft.title);
              if (draft.excerpt) setExcerpt(draft.excerpt);
              if (draft.content_html) setContentHtml(draft.content_html);
              setStep("CONTENT");
            }}
          />
        </details>
      )}

      {/* STEP 3 — CONTENU */}
      {contextValidated && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            3. Contenu éditorial
          </summary>

          <StepContent
            title={title}
            excerpt={excerpt}
            contentHtml={contentHtml}
            outro={outro}
            saving={saving}
            onChange={(d) => {
              if (d.title !== undefined) setTitle(d.title);
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.contentHtml !== undefined)
                setContentHtml(d.contentHtml);
              if (d.outro !== undefined) setOutro(d.outro);
            }}
            onValidate={saveArticle}
          />
        </details>
      )}

      {/* STEP 4 — VISUEL */}
      {internalArticleId && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Visuel
          </summary>

          <StepVisual
            visualChoice={visualChoice}
            setVisualChoice={setVisualChoice}
            topics={topics}
            companies={companies}
            persons={persons}
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
            onNext={() => setStep("PREVIEW")}
          />
        </details>
      )}

      {/* STEP 5 — PREVIEW */}
      {internalArticleId && (
        <details open={step === "PREVIEW"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            5. Aperçu
          </summary>

          <StepPreview
            articleId={internalArticleId}
            onBack={() => setStep("CONTENT")}
            onNext={() => setStep("PUBLISH")}
          />
        </details>
      )}

      {/* STEP 6 — PUBLICATION */}
      {internalArticleId && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            6. Publication
          </summary>

          <StepPublish
            publishMode={publishMode}
            publishAt={publishAt}
            onChangeMode={setPublishMode}
            onChangeDate={setPublishAt}
            onPublish={() => {
              alert("Publication à brancher");
            }}
          />
        </details>
      )}
    </div>
  );
}
