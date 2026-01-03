"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Blocs
import ArticleContextBlock from "@/components/admin/articles/ArticleContextBlock";
import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";
import ArticleContentBlock from "@/components/admin/articles/ArticleContentBlock";
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

type Mode = "create" | "edit";
type Step = "CONTEXT" | "SOURCE" | "CONTENT" | "VISUAL" | "PUBLISH";

type Props = {
  mode: Mode;
  articleId?: string;
};

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function ArticleStudio({ mode, articleId }: Props) {
  /* =========================
     STATE — CONTEXTE
  ========================= */
  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [contextValidated, setContextValidated] = useState(false);

  /* =========================
     STATE — SOURCE
  ========================= */
  const [useSource, setUseSource] = useState<boolean | null>(null);

  /* =========================
     STATE — CONTENU
  ========================= */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [outro, setOutro] = useState("");

  /* =========================
     STATE — VISUEL
  ========================= */
  const [visualChoice, setVisualChoice] = useState<
    "TOPIC" | "COMPANY" | "PERSON" | "ARTICLE"
  >("ARTICLE");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* =========================
     STATE — PUBLICATION
  ========================= */
  const [publishMode, setPublishMode] = useState<"NOW" | "SCHEDULE">("NOW");
  const [publishAt, setPublishAt] = useState<string>("");

  /* =========================
     META
  ========================= */
  const [author, setAuthor] = useState("");
  const [internalArticleId, setInternalArticleId] = useState<string | null>(
    articleId || null
  );
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>("CONTEXT");

  /* =========================
     LOAD (EDIT)
  ========================= */
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

      setTopics((a.topics || []).map((t: any) => ({
        id_topic: t.ID_TOPIC,
        label: t.LABEL,
      })));
      setCompanies((a.companies || []).map((c: any) => ({
        id_company: c.ID_COMPANY,
        name: c.NAME,
      })));
      setPersons((a.persons || []).map((p: any) => ({
        id_person: p.ID_PERSON,
        name: p.NAME,
        role: p.ROLE || "contributeur",
      })));

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

  /* =========================
     SAVE ARTICLE
  ========================= */
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

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* STEP 1 — CONTEXTE */}
      <details open={step === "CONTEXT"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Contexte d’intention
        </summary>

        <ArticleContextBlock
          topics={topics}
          companies={companies}
          persons={persons}
          onChange={(d) => {
            if (d.topics) setTopics(d.topics);
            if (d.companies) setCompanies(d.companies);
            if (d.persons) setPersons(d.persons);
          }}
        />

        {!contextValidated && (
          <button
            onClick={() => {
              if (!topics.length) return alert("Topic requis");
              setContextValidated(true);
              setStep("SOURCE");
            }}
            className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            Valider le contexte
          </button>
        )}
      </details>

      {/* STEP 2 — SOURCE */}
      {contextValidated && (
        <details open={step === "SOURCE"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            2. Source
          </summary>

          <p className="text-sm text-gray-600 mt-2">
            Souhaitez-vous partir d’une source existante ?
          </p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                setUseSource(false);
                setStep("CONTENT");
              }}
              className="px-4 py-2 border rounded"
            >
              Non, écrire directement
            </button>

            <button
              onClick={() => setUseSource(true)}
              className="px-4 py-2 bg-ratecard-blue text-white rounded"
            >
              Transformer une source (assistant)
            </button>
          </div>

          {useSource && (
            <div className="mt-4">
              <ArticleSourcePanel
                onApplyDraft={(draft) => {
                  if (draft.title) setTitle(draft.title);
                  if (draft.excerpt) setExcerpt(draft.excerpt);
                  if (draft.content_html) setContentHtml(draft.content_html);
                  setStep("CONTENT");
                }}
              />
            </div>
          )}
        </details>
      )}

      {/* STEP 3 — CONTENU */}
      {contextValidated && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            3. Contenu éditorial
          </summary>

          <ArticleContentBlock
            title={title}
            excerpt={excerpt}
            contentHtml={contentHtml}
            onChange={(d) => {
              if (d.title !== undefined) setTitle(d.title);
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.contentHtml !== undefined)
                setContentHtml(d.contentHtml);
            }}
          />

          <label className="text-sm font-medium mt-4 block">
            Ce qu’il faut retenir
          </label>
          <textarea
            className="border rounded p-2 w-full"
            value={outro}
            onChange={(e) => setOutro(e.target.value)}
          />

          <button
            onClick={saveArticle}
            disabled={saving}
            className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {saving ? "Enregistrement…" : "Valider le contenu"}
          </button>
        </details>
      )}

      {/* STEP 4 — VISUEL */}
      {internalArticleId && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Visuel
          </summary>

          <p className="text-sm text-gray-600 mb-2">
            Choisissez la source du visuel de l’article.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            {topics.length > 0 && (
              <button
                onClick={() => setVisualChoice("TOPIC")}
                className={`px-3 py-2 border rounded ${
                  visualChoice === "TOPIC" ? "bg-gray-100" : ""
                }`}
              >
                Topic
              </button>
            )}
            {companies.length > 0 && (
              <button
                onClick={() => setVisualChoice("COMPANY")}
                className={`px-3 py-2 border rounded ${
                  visualChoice === "COMPANY" ? "bg-gray-100" : ""
                }`}
              >
                Société
              </button>
            )}
            {persons.length > 0 && (
              <button
                onClick={() => setVisualChoice("PERSON")}
                className={`px-3 py-2 border rounded ${
                  visualChoice === "PERSON" ? "bg-gray-100" : ""
                }`}
              >
                Personne
              </button>
            )}
            <button
              onClick={() => setVisualChoice("ARTICLE")}
              className={`px-3 py-2 border rounded ${
                visualChoice === "ARTICLE" ? "bg-gray-100" : ""
              }`}
            >
              Visuel spécifique
            </button>
          </div>

          {visualChoice === "ARTICLE" && (
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
          )}

          <button
            onClick={() => setStep("PUBLISH")}
            className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            Continuer vers publication
          </button>
        </details>
      )}

      {/* STEP 5 — PUBLICATION */}
      {internalArticleId && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            5. Publication
          </summary>

          <div className="mt-2 space-y-3">
            <label className="block">
              <input
                type="radio"
                checked={publishMode === "NOW"}
                onChange={() => setPublishMode("NOW")}
              />{" "}
              Publier maintenant
            </label>

            <label className="block">
              <input
                type="radio"
                checked={publishMode === "SCHEDULE"}
                onChange={() => setPublishMode("SCHEDULE")}
              />{" "}
              Planifier
            </label>

            {publishMode === "SCHEDULE" && (
              <input
                type="datetime-local"
                className="border rounded p-2"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
              />
            )}
          </div>

          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Publier l’article
          </button>
        </details>
      )}
    </div>
  );
}
