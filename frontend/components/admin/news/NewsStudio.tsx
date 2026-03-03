"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

import NewsStepSource from "@/components/admin/news/steps/NewsStepSource";
import NewsStepContent from "@/components/admin/news/steps/NewsStepContent";
import NewsStepVisual from "@/components/admin/news/steps/NewsStepVisual";
import NewsStepPreview from "@/components/admin/news/steps/NewsStepPreview";
import NewsStepPublish from "@/components/admin/news/steps/NewsStepPublish";
import NewsStepLinkedIn from "@/components/admin/news/steps/NewsStepLinkedIn";

type Mode = "create" | "edit";

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
     STATE
  ========================================================= */

  const [newsKind, setNewsKind] = useState<"NEWS" | "BRIEF">("NEWS");
  const [newsType, setNewsType] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  const [company, setCompany] = useState<any | null>(null);
  const [companyFull, setCompanyFull] = useState<any | null>(null);

  const [topics, setTopics] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);

  const [mediaId, setMediaId] = useState<string | null>(null);
  const [publishAt, setPublishAt] = useState<string>("");

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

  const isStepReached = (target: Step) =>
    stepOrder.indexOf(step) >= stepOrder.indexOf(target);

  /* =========================================================
     INIT STEP
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

        setNewsKind(n.NEWS_KIND || "NEWS");
        setNewsType(n.NEWS_TYPE || null);

        setTitle(n.TITLE || "");
        setExcerpt(n.EXCERPT || "");
        setBody(n.BODY || "");

        // 🔥 Normalisation company en UPPER_CASE
        setCompany(
          n.ID_COMPANY
            ? {
                ID_COMPANY: n.ID_COMPANY,
                NAME: n.COMPANY_NAME,
              }
            : null
        );

        setTopics(n.TOPICS || []);
        setPersons(n.PERSONS || []);
        setConcepts(n.CONCEPTS || []);
        setSolutions(n.SOLUTIONS || []);

        setMediaId(n.MEDIA_RECTANGLE_ID || null);

        if (!searchParams.get("step")) {
          setStep("CONTENT");
        }
      } catch (e) {
        console.error(e);
        alert("Erreur chargement news");
      }
    }

    load();
  }, [mode, newsId, searchParams]);

  /* =========================================================
     LOAD COMPANY FULL
  ========================================================= */

  useEffect(() => {
    if (!company?.ID_COMPANY) {
      setCompanyFull(null);
      return;
    }

    async function loadCompany() {
      try {
        const res = await api.get(`/company/${company.ID_COMPANY}`);
        setCompanyFull(res.company);
      } catch {
        setCompanyFull(null);
      }
    }

    loadCompany();
  }, [company]);

  /* =========================================================
     SAVE
  ========================================================= */

  async function saveNews() {
    if (!title.trim()) return alert("Titre requis");
    if (!excerpt.trim()) return alert("Excerpt requis");
    if (!company?.ID_COMPANY) return alert("Société requise");

    setSaving(true);

    const payload = {
      ID_COMPANY: company.ID_COMPANY,
      NEWS_KIND: newsKind,
      NEWS_TYPE: newsType ?? null,

      TITLE: title,
      EXCERPT: excerpt,
      BODY: newsKind === "NEWS" ? body : null,

      TOPICS: topics.map((t) => t.ID_TOPIC),
      PERSONS: persons.map((p) => p.ID_PERSON),

      CONCEPTS: concepts.map((c) => c.ID_CONCEPT),
      SOLUTIONS: solutions.map((s) => s.ID_SOLUTION),
    };

    try {
      if (!internalNewsId) {
        const res = await api.post("/news/create", payload);

        // 🔥 IMPORTANT : backend renvoie ID_NEWS
        setInternalNewsId(res.ID_NEWS);
      } else {
        await api.put(`/news/update/${internalNewsId}`, payload);
      }

      setStep(newsKind === "BRIEF" ? "PREVIEW" : "VISUAL");
    } catch (e) {
      console.error("SAVE NEWS ERROR", e);
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
      newsKind === "NEWS" &&
      !mediaId &&
      !companyFull?.MEDIA_LOGO_RECTANGLE_ID
    ) {
      return alert("Visuel requis pour une news");
    }

    if (!publishAt) return alert("Date requise");

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
      <details open={step === "SOURCE"} className="border rounded p-4">
        <summary onClick={() => setStep("SOURCE")} className="font-semibold">
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

      {isStepReached("CONTENT") && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary onClick={() => setStep("CONTENT")} className="font-semibold">
            2. Contenu
          </summary>

          <NewsStepContent
            title={title}
            excerpt={excerpt}
            body={body}
            company={company}
            topics={topics}
            persons={persons}
            concepts={concepts}
            solutions={solutions}
            newsKind={newsKind}
            newsType={newsType}
            onChange={(d) => {
              if (d.newsKind !== undefined) setNewsKind(d.newsKind);
              if (d.newsType !== undefined) setNewsType(d.newsType);
              if (d.title !== undefined) setTitle(d.title);
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.body !== undefined) setBody(d.body);
              if (d.company !== undefined) setCompany(d.company);
              if (d.topics !== undefined) setTopics(d.topics);
              if (d.persons !== undefined) setPersons(d.persons);
              if (d.concepts !== undefined) setConcepts(d.concepts);
              if (d.solutions !== undefined) setSolutions(d.solutions);
            }}
            onValidate={saveNews}
            saving={saving}
          />
        </details>
      )}

      {newsKind === "NEWS" && isStepReached("VISUAL") && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary onClick={() => setStep("VISUAL")} className="font-semibold">
            3. Visuel
          </summary>

          {internalNewsId && (
            <NewsStepVisual
              newsId={internalNewsId}
              mediaId={mediaId}
              companyMediaId={companyFull?.MEDIA_LOGO_RECTANGLE_ID || null}
              onUpdated={setMediaId}
              onNext={() => setStep("PREVIEW")}
            />
          )}
        </details>
      )}

      {isStepReached("PREVIEW") && internalNewsId && (
        <NewsStepPreview
          newsId={internalNewsId}
          onNext={() => setStep("PUBLISH")}
        />
      )}

      {isStepReached("PUBLISH") && internalNewsId && (
        <NewsStepPublish
          publishAt={publishAt}
          publishing={publishing}
          onChangeDate={setPublishAt}
          onPublish={publishNews}
        />
      )}

      {newsKind === "NEWS" &&
        isStepReached("LINKEDIN") &&
        internalNewsId && (
          <NewsStepLinkedIn
            newsId={internalNewsId}
            title={title}
            excerpt={excerpt}
          />
        )}
    </div>
  );
}
