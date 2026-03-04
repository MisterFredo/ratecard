"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// STEPS
import StepContext from "@/components/admin/content/steps/StepContext";
import StepSource from "@/components/admin/content/steps/StepSource";
import StepAngles from "@/components/admin/content/steps/StepAngles";
import StepContent from "@/components/admin/content/steps/StepContent";
import StepPreview from "@/components/admin/content/steps/StepPreview";
import StepPublish from "@/components/admin/content/steps/StepPublish";

type Mode = "create" | "edit";

type Step =
  | "CONTEXT"
  | "SOURCE"
  | "ANGLES"
  | "CONTENT"
  | "PREVIEW"
  | "PUBLISH";

type Props = {
  mode: Mode;
  contentId?: string;
};

export default function ContentStudio({ mode, contentId }: Props) {
  const [topics, setTopics] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);

  const [contextValidated, setContextValidated] = useState(false);

  const [sourceType, setSourceType] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");

  const [selectedAngle, setSelectedAngle] = useState<any | null>(null);

  const [excerpt, setExcerpt] = useState("");
  const [concept, setConcept] = useState("");
  const [conceptId, setConceptId] = useState<string | null>(null);
  const [contentBody, setContentBody] = useState("");

  const [citations, setCitations] = useState<string[]>([]);
  const [chiffres, setChiffres] = useState<string[]>([]);
  const [acteurs, setActeurs] = useState<string[]>([]);

  const [dateCreation, setDateCreation] = useState<string>("");

  const [dateImport] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [publishMode, setPublishMode] =
    useState<"NOW" | "SCHEDULE">("NOW");
  const [publishAt, setPublishAt] = useState<string>("");

  const [internalContentId, setInternalContentId] = useState<string | null>(
    contentId || null
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState<Step>("CONTEXT");

  // ==========================================================
  // LOAD EDIT MODE
  // ==========================================================
  useEffect(() => {
    if (mode !== "edit" || !contentId) return;

    async function load() {
      try {
        const res = await api.get(`/content/${contentId}`);
        const c = res.content;

        setExcerpt(c.CONCEPT || "");
        setConcept(c.CONCEPT || "");
        setConceptId(c.CONCEPT_ID || null);
        setContentBody(c.CONTENT_BODY || "");

        setCitations(c.CITATIONS || []);
        setChiffres(c.CHIFFRES || []);
        setActeurs(c.ACTEURS_CITES || []);

        setDateCreation(c.DATE_CREATION || "");

        setTopics(
          (c.topics || []).map((t: any) => ({
            id_topic: t.ID_TOPIC,
            label: t.LABEL,
          }))
        );

        setEvents(
          (c.events || []).map((e: any) => ({
            id_event: e.ID_EVENT,
            label: e.LABEL,
          }))
        );

        setCompanies(
          (c.companies || []).map((co: any) => ({
            id_company: co.ID_COMPANY,
            name: co.NAME,
          }))
        );

        setSolutions(
          (c.solutions || []).map((s: any) => ({
            ID_SOLUTION: s.ID_SOLUTION,
            TITLE: s.NAME,
          }))
        );

        setSelectedAngle({
          angle_title: c.ANGLE_TITLE,
          angle_signal: c.ANGLE_SIGNAL,
          concept: c.CONCEPT,
          concept_id: c.CONCEPT_ID,
        });

        setContextValidated(true);
        setStep("CONTENT");
      } catch (e) {
        console.error(e);
        alert("Erreur chargement contenu");
      }
    }

    load();
  }, [mode, contentId]);

  // ==========================================================
  // SAVE
  // ==========================================================
  async function saveContent() {
    if (!selectedAngle || !conceptId) {
      alert("Concept pivot requis");
      return;
    }

    if (!excerpt.trim() || !contentBody.trim()) {
      alert("Contenu incomplet");
      return;
    }

    if (!topics.length && !events.length && !companies.length) {
      alert("Au moins une entité est requise");
      return;
    }

    setSaving(true);

    const payload = {
      angle_title: selectedAngle.angle_title,
      angle_signal: selectedAngle.angle_signal,

      excerpt,
      concept,
      concept_id: conceptId, // 🔥 pivot gouverné

      content_body: contentBody,

      citations,
      chiffres,
      acteurs_cites: acteurs,

      topics: topics.map((t) => t.id_topic),
      events: events.map((e) => e.id_event),
      companies: companies.map((c) => c.id_company),

      solutions: solutions.map((s) => s.ID_SOLUTION),

      date_creation: dateCreation || null,
      date_import: dateImport,
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

  // ==========================================================
  // PUBLISH
  // ==========================================================
  async function publishContent() {
    if (!internalContentId) return;

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

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <div className="space-y-6">
      <details open={step === "CONTEXT"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Contexte
        </summary>

        <StepContext
          topics={topics}
          events={events}
          companies={companies}
          solutions={solutions}
          dateCreation={dateCreation}
          onChangeDateCreation={setDateCreation}
          onChange={(d) => {
            if (d.topics) setTopics(d.topics);
            if (d.events) setEvents(d.events);
            if (d.companies) setCompanies(d.companies);
            if (d.solutions) setSolutions(d.solutions);
          }}
          onValidate={() => {
            if (!topics.length && !events.length && !companies.length) {
              alert("Au moins une entité est requise");
              return;
            }
            setContextValidated(true);
            setStep("SOURCE");
          }}
        />
      </details>

      {/* Steps suivants inchangés (SOURCE, ANGLES, CONTENT, etc.) */}

    </div>
  );
}
