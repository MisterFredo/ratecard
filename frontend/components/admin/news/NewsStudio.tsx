"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

// STEPS
import NewsStepSource from "@/components/admin/news/steps/NewsStepSource";
import NewsStepContent from "@/components/admin/news/steps/NewsStepContent";
import NewsStepVisual from "@/components/admin/news/steps/NewsStepVisual";
import NewsStepPreview from "@/components/admin/news/steps/NewsStepPreview";
import NewsStepPublish from "@/components/admin/news/steps/NewsStepPublish";
import NewsStepLinkedIn from "@/components/admin/news/steps/NewsStepLinkedIn";

type Mode = "create" | "edit";
type NewsType = "NEWS" | "BRIEF";

type Step =
  | "SOURCE"
  | "CONTENT"
  | "VISUAL"
  | "PREVIEW"
  | "PUBLISH"
  | "LINKEDIN";

type Props = {
  mode: Mode;
  newsId?: string;
};

export default function NewsStudio({ mode, newsId }: Props) {
  const searchParams = useSearchParams();

  /* =========================================================
     STATE — CORE
  ========================================================= */
  const [newsType, setNewsType] = useState<NewsType>("NEWS");
  const [contentType, setContentType] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  const [company, setCompany] = useState<any | null>(null);
  const [companyFull, setCompanyFull] = useState<any | null>(null);

  const [topics, setTopics] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  /* =========================================================
     VISUEL
  ========================================================= */
  const [mediaId, setMediaId] = useState<string | null>(null);

  /* =========================================================
     PUBLICATION
  ========================================================= */
  const [publishAt, setPublishAt] = useState<string>("");

  /* =========================================================
     META
  ========================================================= */
  const [internalNewsId, setInternalNewsId] = useState<string | null>(
    newsId || null
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState<Step>("SOURCE");

  const stepOrder: Step[] = [
    "SOURCE",
    "CONTENT",
    "VISUAL",
    "PREVIEW",
    "PUBLISH",
    "LINKEDIN",
  ];

  function isStepReached(target: Step) {
    return stepOrder.indexOf(step) >= stepOrder.indexOf(target);
  }

  /* =========================================================
     INIT STEP FROM URL
  ========================================================= */
  useEffect(() => {
    const stepParam = searchParams.get("step") as Step | null;
    if (stepParam && stepOrder.includes(stepParam)) {
      setStep(stepParam);
    }
  }, [searchParams]);

  /* =========================================================
     LOAD NEWS (EDIT)
  ========================================================= */
  useEffect(() => {
    if (mode !== "edit" || !newsId) return;

    async function load() {
      try {
        const res = await api.get(`/news/${newsId}`);
        const n = res.news;

        setNewsType(n.NEWS_TYPE || "NEWS");
        setContentType(n.TYPE || null);

        setTitle(n.TITLE || "");
        setExcerpt(n.EXCERPT || "");
        setBody(n.BODY || "");

        setCompany(
          n.company
            ? {
                id_company: n.company.ID_COMPANY,
                name: n.company.NAME,
              }
            : null
        );

        setTopics(
          (n.topics || []).map((t: any) => ({
            id_topic: t.ID_TOPIC,
            label: t.LABEL,
          }))
        );

        setPersons(n.persons || []);
        setMediaId(n.MEDIA_RECTANGLE_ID || null);

        if (!searchParams.get("step")) {
          setStep("CONTENT");
        }
      } catch (e) {
        console.error(e);
        alert("Erreur chargement contenu");
      }
    }

    load();
  }, [mode, newsId, searchParams]);

  /* =========================================================
     LOAD COMPANY FULL
  ========================================================= */
  useEffect(() => {
    if (!company?.id_company && !company?.ID_COMPANY) {
      setCompanyFull(null);
      return;
    }

    const companyId =
      company.id_company || company.ID_COMPANY;

    api
      .get(`/company/${companyId}`)
      .then((res) => setCompanyFull(res.company))
      .catch(() => setCompanyFull(null));
  }, [company]);

  /* =========================================================
     SAVE NEWS / BRIEF
  ========================================================= */
  async function saveNews() {
    if (!title.trim()) {
      alert("Titre requis");
      return;
    }

    if (!company) {
      alert("Société requise");
      return;
    }

    setSaving(true);

    const payload = {
      id_company: company.id_company || company.ID_COMPANY,
      title,
      excerpt,
      body: newsType === "BRIEF" ? null : body,

      news_type: newsType,
      type: contentType,

      topics: topics.map((t) => t.id_topic),
      persons: persons.map((p) => p.id_person || p.ID_PERSON),
    };

    try {
      if (!internalNewsId) {
        const res = await api.post("/news/create", payload);
        setInternalNewsId(res.id_news);
      } else {
        await api.put(`/news/update/${internalNewsId}`, payload);
      }

      setStep(newsType === "BRIEF" ? "PREVIEW" : "VISUAL");
    } catch (e) {
      console.error(e);
      alert("Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     PUBLISH
  ========================================================= */
  async function publishNews() {
    if (!internalNewsId) return;

    if (
      newsType === "NEWS" &&
      !mediaId &&
      !companyFull?.MEDIA_LOGO_RECTANGLE_ID
    ) {
      alert("Visuel requis pour une news");
      return;
    }

    if (!publishAt) {
      alert("Date requise");
      return;
    }

    setPublishing(true);

    try {
      await api.post(`/news/publish/${internalNewsId}`, {
        publish_at: new Date(publishAt).toISOString(),
      });

      setStep("LINKEDIN");
    } catch {
      alert("Erreur publication");
    } finally {
      setPublishing(false);
    }
  }

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div className="space-y-6">

      {/* TYPE */}
      <div className="border rounded p-4 bg-gray-50 space-y-3">
        <div>
          <label className="block font-medium mb-1">
            Nature du contenu
          </label>
          <select
            value={newsType}
            onChange={(e) =>
              setNewsType(e.target.value as NewsType)
            }
            className="border rounded p-2"
          >
            <option value="NEWS">News</option>
            <option value="BRIEF">Brève</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Catégorie
          </label>
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={contentType || ""}
            onChange={(e) => setContentType(e.target.value)}
            placeholder="partenariat, produit, client…"
          />
        </div>
      </div>

      {/* SOURCE */}
      <details open={step === "SOURCE"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Source
        </summary>

        <NewsStepSource
          onGenerated={({ title, excerpt, body }) => {
            setTitle(title);
            setExcerpt(excerpt);
            setBody(body);
            setStep("CONTENT");
          }}
          onSkip={() => setStep("CONTENT")}
        />
      </details>

      {/* CONTENT */}
      {isStepReached("CONTENT") && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            2. Contenu
          </summary>

          <NewsStepContent
            title={title}
            excerpt={excerpt}
            body={body}
            company={company}
            topics={topics}
            persons={persons}
            onChange={(d) => {
              if (d.title !== undefined) setTitle(d.title);
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.body !== undefined) setBody(d.body);
              if (d.company !== undefined) setCompany(d.company);
              if (d.topics !== undefined) setTopics(d.topics);
              if (d.persons !== undefined) setPersons(d.persons);
            }}
            onValidate={saveNews}
            saving={saving}
          />
        </details>
      )}

      {/* VISUAL */}
      {newsType === "NEWS" && isStepReached("VISUAL") && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            3. Visuel
          </summary>

          {internalNewsId && (
            <NewsStepVisual
              newsId={internalNewsId}
              mediaId={mediaId}
              companyMediaId={
                companyFull?.MEDIA_LOGO_RECTANGLE_ID || null
              }
              onUpdated={setMediaId}
              onNext={() => setStep("PREVIEW")}
            />
          )}
        </details>
      )}

      {/* PREVIEW */}
      {isStepReached("PREVIEW") && (
        <details open={step === "PREVIEW"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Aperçu
          </summary>

          {internalNewsId && (
            <NewsStepPreview
              newsId={internalNewsId}
              onNext={() => setStep("PUBLISH")}
            />
          )}
        </details>
      )}

      {/* PUBLISH */}
      {isStepReached("PUBLISH") && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            5. Publication
          </summary>

          {internalNewsId && (
            <NewsStepPublish
              publishAt={publishAt}
              publishing={publishing}
              onChangeDate={setPublishAt}
              onPublish={publishNews}
            />
          )}
        </details>
      )}

      {/* LINKEDIN */}
      {newsType === "NEWS" &&
        isStepReached("LINKEDIN") &&
        internalNewsId && (
          <details open className="border rounded p-4">
            <summary className="font-semibold">
              6. Post LinkedIn
            </summary>

            <NewsStepLinkedIn
              newsId={internalNewsId}
              title={title}
              excerpt={excerpt}
            />
          </details>
        )}
    </div>
  );
}

