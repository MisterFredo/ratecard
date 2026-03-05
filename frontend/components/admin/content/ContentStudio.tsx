"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import StepSource from "@/components/admin/content/steps/StepSource";
import StepSummary from "@/components/admin/content/steps/StepSummary";
import StepContext from "@/components/admin/content/steps/StepContext";
import StepPreview from "@/components/admin/content/steps/StepPreview";
import StepPublish from "@/components/admin/content/steps/StepPublish";
import AutoContextMatcher from "@/components/admin/content/AutoContextMatcher";

type Mode = "create" | "edit";

type Step =
  | "SOURCE"
  | "SUMMARY"
  | "CONTEXT"
  | "PREVIEW"
  | "PUBLISH";

type Props = {
  mode: Mode;
  contentId?: string;
};

export default function ContentStudio({ mode, contentId }: Props) {

  const [step, setStep] = useState<Step>("SOURCE");

  const [internalContentId, setInternalContentId] =
    useState<string | null>(contentId || null);

  // SOURCE
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");

  // SUMMARY
  const [excerpt, setExcerpt] = useState("");
  const [contentBody, setContentBody] = useState("");

  const [citations, setCitations] = useState<string[]>([]);
  const [chiffres, setChiffres] = useState<string[]>([]);
  const [acteurs, setActeurs] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [solutions, setSolutions] = useState<string[]>([]);

  // CONTEXT (gouverné)
  const [topics, setTopics] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contextSolutions, setContextSolutions] = useState<any[]>([]);

  // PUBLISH
  const [publishMode, setPublishMode] =
    useState<"NOW" | "SCHEDULE">("NOW");

  const [publishAt, setPublishAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // ============================================================
  // LOAD EDIT
  // ============================================================

  useEffect(() => {

    if (mode !== "edit" || !contentId) return;

    async function load() {

      try {

        const res = await api.get(`/content/${contentId}`);
        const c = res.content;

        setExcerpt(c.excerpt || "");
        setContentBody(c.content_body || "");

        setCitations(c.citations || []);
        setChiffres(c.chiffres || []);
        setActeurs(c.acteurs_cites || []);
        setConcepts(c.concepts || []);

        setTopics(c.topics || []);
        setEvents(c.events || []);
        setCompanies(c.companies || []);
        setContextSolutions(c.solutions || []);

        setStep("SUMMARY");

      } catch (e) {

        console.error(e);
        alert("Erreur chargement contenu");

      }

    }

    load();

  }, [mode, contentId]);

  // ============================================================
  // SAVE CONTENT
  // ============================================================

  async function saveContent() {

    if (!excerpt.trim() || !contentBody.trim()) {
      alert("Summary incomplet");
      return;
    }

    if (!topics.length && !events.length && !companies.length) {
      alert("Au moins une entité est requise");
      return;
    }

    setSaving(true);

    const payload = {

      title: excerpt.slice(0, 120),

      excerpt,
      content_body: contentBody,

      citations,
      chiffres,
      acteurs_cites: acteurs,

      concepts,

      topics: topics.map((t) => t.id_topic),
      events: events.map((e) => e.id_event),
      companies: companies.map((c) => c.id_company),
      solutions: contextSolutions.map((s) => s.id_solution)

    };

    try {

      if (!internalContentId) {

        const res = await api.post("/content/create", payload);
        setInternalContentId(res.id_content);

      } else {

        await api.put(`/content/update/${internalContentId}`, payload);

      }

      setStep("PREVIEW");

    } catch (e) {

      console.error(e);
      alert("❌ Erreur sauvegarde contenu");

    }

    setSaving(false);

  }

  // ============================================================
  // PUBLISH
  // ============================================================

  async function publishContent() {

    if (!internalContentId) return;

    if (publishMode === "SCHEDULE" && !publishAt) {
      alert("Merci de sélectionner une date de publication.");
      return;
    }

    setPublishing(true);

    try {

      await api.post(`/content/publish/${internalContentId}`, {

        publish_at:
          publishMode === "NOW"
            ? null
            : new Date(publishAt).toISOString(),

      });

      alert("Contenu publié");

    } catch (e) {

      console.error(e);
      alert("Erreur publication");

    } finally {

      setPublishing(false);

    }

  }

  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="space-y-6">

      {/* SOURCE */}
      <details open={step === "SOURCE"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Source
        </summary>

        <StepSource
          onSubmit={({ source_id, text }) => {
            setSourceId(source_id);
            setSourceText(text);
            setStep("SUMMARY");
          }}
        />
      </details>

      {/* SUMMARY */}
      {sourceText && (
        <details open={step === "SUMMARY"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            2. Synthèse
          </summary>

          <StepSummary
            sourceId={sourceId}
            sourceText={sourceText}
            excerpt={excerpt}
            contentBody={contentBody}
            citations={citations}
            chiffres={chiffres}
            acteurs={acteurs}
            concepts={concepts}
            solutions={solutions}
            onChange={(d) => {
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.contentBody !== undefined) setContentBody(d.contentBody);
              if (d.citations !== undefined) setCitations(d.citations);
              if (d.chiffres !== undefined) setChiffres(d.chiffres);
              if (d.acteurs !== undefined) setActeurs(d.acteurs);
              if (d.concepts !== undefined) setConcepts(d.concepts);
              if (d.solutions !== undefined) setSolutions(d.solutions);
            }}
            onNext={() => setStep("CONTEXT")}
          />
        </details>
      )}

      {/* CONTEXT */}
      {step !== "SOURCE" && (
        <details open={step === "CONTEXT"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            3. Contexte
          </summary>

          <StepContext
            topics={topics}
            events={events}
            companies={companies}
            solutions={contextSolutions}
            onChange={(d) => {
              if (d.topics) setTopics(d.topics);
              if (d.events) setEvents(d.events);
              if (d.companies) setCompanies(d.companies);
              if (d.solutions) setContextSolutions(d.solutions);
            }}
            onValidate={saveContent}
          />
        </details>
      )}

      {/* PREVIEW */}
      {internalContentId && (
        <details open={step === "PREVIEW"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Aperçu
          </summary>

          <StepPreview
            contentId={internalContentId}
            onBack={() => setStep("CONTEXT")}
            onNext={() => setStep("PUBLISH")}
          />
        </details>
      )}

      {/* PUBLISH */}
      {internalContentId && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            5. Publication
          </summary>

          <StepPublish
            publishMode={publishMode}
            publishAt={publishAt}
            publishing={publishing}
            onChangeMode={setPublishMode}
            onChangeDate={setPublishAt}
            onPublish={publishContent}
          />
        </details>
      )}

    </div>

  );

}
