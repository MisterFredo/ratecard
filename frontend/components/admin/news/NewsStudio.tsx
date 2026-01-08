"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// STEPS
import NewsStepSource from "@/components/admin/news/steps/NewsStepSource";
import NewsStepContent from "@/components/admin/news/steps/NewsStepContent";
import NewsStepVisual from "@/components/admin/news/steps/NewsStepVisual";
import NewsStepPreview from "@/components/admin/news/steps/NewsStepPreview";
import NewsStepPublish from "@/components/admin/news/steps/NewsStepPublish";

type Mode = "create" | "edit";

type Step =
  | "SOURCE"
  | "CONTENT"
  | "VISUAL"
  | "PREVIEW"
  | "PUBLISH";

type Props = {
  mode: Mode;
  newsId?: string;
};

export default function NewsStudio({ mode, newsId }: Props) {
  /* =========================================================
     STATE — CORE
  ========================================================= */
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [company, setCompany] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  /* =========================================================
     STATE — VISUEL
  ========================================================= */
  const [mediaId, setMediaId] = useState<string | null>(null);

  /* =========================================================
     PUBLICATION
  ========================================================= */
  const [publishMode, setPublishMode] =
    useState<"NOW" | "SCHEDULE">("NOW");
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

  /* =========================================================
     UTILS — STEP ORDER (POUR RÉVÉLATION PROGRESSIVE)
  ========================================================= */
  const stepOrder: Step[] = [
    "SOURCE",
    "CONTENT",
    "VISUAL",
    "PREVIEW",
    "PUBLISH",
  ];

  function isStepReached(target: Step) {
    return (
      stepOrder.indexOf(step) >= stepOrder.indexOf(target)
    );
  }

  /* =========================================================
     LOAD NEWS (EDIT MODE)
  ========================================================= */
  useEffect(() => {
    if (mode !== "edit" || !newsId) return;

    async function load() {
      try {
        const res = await api.get(`/news/${newsId}`);
        const n = res.news;

        setTitle(n.TITLE || "");
        setBody(n.BODY || "");

        setCompany(n.company || null);
        setTopics(n.topics || []);
        setPersons(n.persons || []);

        setMediaId(n.MEDIA_RECTANGLE_ID || null);

        setStep("CONTENT");
      } catch (e) {
        console.error(e);
        alert("Erreur chargement news");
      }
    }

    load();
  }, [mode, newsId]);

  /* =========================================================
     SAVE NEWS (CREATE / UPDATE)
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
      body,
      topics: topics.map((t) => t.id_topic || t.ID_TOPIC),
      persons: persons.map((p) => p.id_person || p.ID_PERSON),
    };

    try {
      if (!internalNewsId) {
        const res = await api.post("/news/create", payload);
        setInternalNewsId(res.id_news);
      } else {
        await api.put(`/news/update/${internalNewsId}`, payload);
      }

      setStep("VISUAL");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur sauvegarde news");
    }

    setSaving(false);
  }

  /* =========================================================
     PUBLISH NEWS
  ========================================================= */
  async function publishNews() {
    if (!internalNewsId) return;

    if (!mediaId) {
      alert("Un visuel est obligatoire");
      return;
    }

    setPublishing(true);

    try {
      await api.post(`/news/publish/${internalNewsId}`, {
        mode: publishMode,
        publish_at:
          publishMode === "SCHEDULE" ? publishAt : null,
      });

      alert("News publiée");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur publication news");
    }

    setPublishing(false);
  }

  /* =========================================================
     UI — STUDIO AVEC RÉVÉLATION PROGRESSIVE
  ========================================================= */
  return (
    <div className="space-y-6">
      {/* STEP 1 — SOURCE (toujours visible) */}
      <details open={step === "SOURCE"} className="border rounded p-4">
        <summary
          className="font-semibold cursor-pointer"
          onClick={() => setStep("SOURCE")}
        >
          1. Source
        </summary>

        <NewsStepSource
          onGenerated={({ title, body }) => {
            setTitle(title);
            setBody(body);
            setStep("CONTENT");
          }}
          onSkip={() => setStep("CONTENT")}
        />
      </details>

      {/* STEP 2 — CONTENT */}
      {isStepReached("CONTENT") && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("CONTENT")}
          >
            2. Contenu
          </summary>

          <NewsStepContent
            title={title}
            body={body}
            company={company}
            topics={topics}
            persons={persons}
            onChange={(d) => {
              if (d.title !== undefined) setTitle(d.title);
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

      {/* STEP 3 — VISUEL */}
      {isStepReached("VISUAL") && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("VISUAL")}
          >
            3. Visuel
          </summary>

          {internalNewsId && (
            <NewsStepVisual
              newsId={internalNewsId}
              mediaId={mediaId}
              onUpdated={setMediaId}
              onNext={() => setStep("PREVIEW")}
            />
          )}
        </details>
      )}

      {/* STEP 4 — PREVIEW */}
      {isStepReached("PREVIEW") && (
        <details open={step === "PREVIEW"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("PREVIEW")}
          >
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

      {/* STEP 5 — PUBLISH */}
      {isStepReached("PUBLISH") && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary
            className="font-semibold cursor-pointer"
            onClick={() => setStep("PUBLISH")}
          >
            5. Publication
          </summary>

          {internalNewsId && (
            <NewsStepPublish
              publishMode={publishMode}
              publishAt={publishAt}
              publishing={publishing}
              onChangeMode={setPublishMode}
              onChangeDate={setPublishAt}
              onPublish={publishNews}
            />
          )}
        </details>
      )}
    </div>
  );
}
