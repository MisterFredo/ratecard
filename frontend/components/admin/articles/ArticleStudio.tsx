"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Blocs
import ArticleContextBlock from "@/components/admin/articles/ArticleContextBlock";
import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";
import ArticleContentBlock from "@/components/admin/articles/ArticleContentBlock";
import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

type Mode = "create" | "edit";

type Step =
  | "CONTEXT"
  | "START"
  | "CONTENT"
  | "VISUAL"
  | "PUBLISH";

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
     STATE — DÉMARRAGE
  ========================= */
  const [startMode, setStartMode] = useState<"MANUAL" | "SOURCE" | null>(null);

  /* =========================
     STATE — CONTENU
  ========================= */
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [intro, setIntro] = useState("");
  const [outro, setOutro] = useState("");

  /* =========================
     STATE — VISUELS
  ========================= */
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* =========================
     STATE — META
  ========================= */
  const [author, setAuthor] = useState("");
  const [internalArticleId, setInternalArticleId] = useState<string | null>(
    articleId || null
  );
  const [saving, setSaving] = useState(false);

  /* =========================
     NAVIGATION
  ========================= */
  const [step, setStep] = useState<Step>("CONTEXT");

  /* =========================
     LOAD (EDIT MODE)
  ========================= */
  useEffect(() => {
    if (mode !== "edit" || !articleId) return;

    async function load() {
      const res = await api.get(`/articles/${articleId}`);
      const a = res.article;

      setTitle(a.TITLE || "");
      setExcerpt(a.EXCERPT || "");
      setContentHtml(a.CONTENT_HTML || "");
      setIntro(a.INTRO || "");
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
    <div className="space-y-8">

      {/* =========================
          STEP 1 — CONTEXTE
      ========================= */}
      <details open={step === "CONTEXT"} className="border rounded p-4">
        <summary className="text-lg font-semibold cursor-pointer">
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
              setStep("START");
            }}
            className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            Valider le contexte
          </button>
        )}
      </details>

      {/* =========================
          STEP 2 — DÉMARRAGE
      ========================= */}
      {contextValidated && (
        <details open={step === "START"} className="border rounded p-4">
          <summary className="text-lg font-semibold cursor-pointer">
            2. Démarrage
          </summary>

          <div className="flex gap-4 mt-4">
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
            <div className="mt-4">
              <ArticleSourcePanel
                onApplyDraft={(draft) => {
                  if (draft.title) setTitle(draft.title);
                  if (draft.excerpt) setExcerpt(draft.excerpt);
                  if (draft.content_html) setContentHtml(draft.content_html);
                  if (draft.intro) setIntro(draft.intro);
                  setStep("CONTENT");
                }}
              />
            </div>
          )}
        </details>
      )}

      {/* =========================
          STEP 3 — CONTENU
      ========================= */}
      {contextValidated && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary className="text-lg font-semibold cursor-pointer">
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

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Intro (idée forte)</label>
            <textarea
              className="border rounded p-2 w-full"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />

            <label className="text-sm font-medium">Outro (à retenir)</label>
            <textarea
              className="border rounded p-2 w-full"
              value={outro}
              onChange={(e) => setOutro(e.target.value)}
            />
          </div>

          <button
            onClick={saveArticle}
            disabled={saving}
            className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {saving ? "Enregistrement…" : "Valider le contenu"}
          </button>
        </details>
      )}

      {/* =========================
          STEP 4 — VISUEL
      ========================= */}
      {internalArticleId && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary className="text-lg font-semibold cursor-pointer">
            4. Visuel
          </summary>

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

          <button
            onClick={() => setStep("PUBLISH")}
            className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            Continuer vers publication
          </button>
        </details>
      )}

      {/* =========================
          STEP 5 — PUBLICATION
      ========================= */}
      {internalArticleId && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary className="text-lg font-semibold cursor-pointer">
            5. Publication
          </summary>

          <p className="text-sm text-gray-600">
            L’article est prêt. Vous pourrez gérer la publication (maintenant ou
            planifiée) à l’étape suivante.
          </p>

          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Publier l’article
          </button>
        </details>
      )}
    </div>
  );
}
