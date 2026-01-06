"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// STEPS
import StepContext from "@/components/admin/content/steps/StepContext";
import StepSource from "@/components/admin/content/steps/StepSource";
import StepAngles from "@/components/admin/content/steps/StepAngles";
import StepContent from "@/components/admin/content/steps/StepContent";
import StepVisual from "@/components/admin/content/steps/StepVisual";
import StepPreview from "@/components/admin/content/steps/StepPreview";
import StepPublish from "@/components/admin/content/steps/StepPublish";

type Mode = "create" | "edit";

type Step =
  | "CONTEXT"
  | "SOURCE"
  | "ANGLES"
  | "CONTENT"
  | "VISUAL"
  | "PREVIEW"
  | "PUBLISH";

type Props = {
  mode: Mode;
  contentId?: string;
};

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function ContentStudio({ mode, contentId }: Props) {
  /* =========================================================
     STATE — CONTEXTE
  ========================================================= */
  const [topics, setTopics] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [contextValidated, setContextValidated] = useState(false);

  /* =========================================================
     STATE — SOURCE
  ========================================================= */
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");

  /* =========================================================
     STATE — ANGLE
  ========================================================= */
  const [selectedAngle, setSelectedAngle] = useState<any | null>(null);

  /* =========================================================
     STATE — CONTENT (EDITABLE & VALIDATED)
  ========================================================= */
  const [excerpt, setExcerpt] = useState("");
  const [concept, setConcept] = useState("");
  const [contentBody, setContentBody] = useState("");

  const [citations, setCitations] = useState<string[]>([]);
  const [chiffres, setChiffres] = useState<string[]>([]);
  const [acteurs, setActeurs] = useState<string[]>([]);

  /* =========================================================
     STATE — DATES
  ========================================================= */
  // Date éditoriale réelle (tri site)
  const [dateCreation, setDateCreation] = useState<string>("");

  // Date système (import Ratecard)
  const [dateImport, setDateImport] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  /* =========================================================
     STATE — VISUEL
  ========================================================= */
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* =========================================================
     STATE — PUBLICATION
  ========================================================= */
  const [publishMode, setPublishMode] =
    useState<"NOW" | "SCHEDULE">("NOW");
  const [publishAt, setPublishAt] = useState<string>("");

  /* =========================================================
     META
  ========================================================= */
  const [internalContentId, setInternalContentId] = useState<string | null>(
    contentId || null
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState<Step>("CONTEXT");

  /* =========================================================
     LOAD CONTENT (EDIT MODE)
  ========================================================= */
  useEffect(() => {
    if (mode !== "edit" || !contentId) return;

    async function load() {
      try {
        const res = await api.get(`/content/${contentId}`);
        const c = res.content;

        setExcerpt(c.EXCERPT || "");
        setConcept(c.CONCEPT || "");
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
        setPersons(
          (c.persons || []).map((p: any) => ({
            id_person: p.ID_PERSON,
            name: p.NAME,
            role: p.ROLE || "contributeur",
          }))
        );

        setSelectedAngle({
          angle_title: c.ANGLE_TITLE,
          angle_signal: c.ANGLE_SIGNAL,
        });

        setRectUrl(
          c.MEDIA_RECTANGLE_ID
            ? `${GCS}/content/${c.MEDIA_RECTANGLE_ID}`
            : null
        );

        setContextValidated(true);
        setStep("CONTENT");
      } catch (e) {
        console.error(e);
        alert("Erreur chargement contenu");
      }
    }

    load();
  }, [mode, contentId]);

  /* =========================================================
     SAVE CONTENT (CREATE / UPDATE)
  ========================================================= */
  async function saveContent() {
    if (!selectedAngle) {
      alert("Angle requis");
      return;
    }

    if (!excerpt.trim() || !contentBody.trim()) {
      alert("Contenu incomplet");
      return;
    }

    if (
      !topics.length &&
      !events.length &&
      !companies.length &&
      !persons.length
    ) {
      alert("Au moins une entité est requise");
      return;
    }

    setSaving(true);

    const payload = {
      angle_title: selectedAngle.angle_title,
      angle_signal: selectedAngle.angle_signal,

      excerpt,
      concept,
      content_body: contentBody,

      citations,
      chiffres,
      acteurs_cites: acteurs,

      topics: topics.map((t) => t.id_topic),
      events: events.map((e) => e.id_event),
      companies: companies.map((c) => c.id_company),
      persons: persons.map((p) => ({
        id_person: p.id_person,
        role: p.role || "contributeur",
      })),

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

      setStep("VISUAL");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur sauvegarde contenu");
    }

    setSaving(false);
  }

  /* =========================================================
     PUBLISH CONTENT
  ========================================================= */
  async function publishContent() {
    if (!internalContentId) return;

    setPublishing(true);

    try {
      await api.post(`/content/publish/${internalContentId}`, {
        mode: publishMode,
        publish_at:
          publishMode === "SCHEDULE" ? publishAt : null,
      });

      alert("Contenu publié");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur publication contenu");
    }

    setPublishing(false);
  }

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div className="space-y-6">

      {/* STEP 1 — CONTEXTE */}
      <details open={step === "CONTEXT"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Contexte
        </summary>

        <StepContext
          topics={topics}
          events={events}
          companies={companies}
          persons={persons}
          dateCreation={dateCreation}
          onChangeDateCreation={setDateCreation}
          onChange={(d) => {
            if (d.topics) setTopics(d.topics);
            if (d.events) setEvents(d.events);
            if (d.companies) setCompanies(d.companies);
            if (d.persons) setPersons(d.persons);
          }}
          onValidate={() => {
            if (
              !topics.length &&
              !events.length &&
              !companies.length &&
              !persons.length
            ) {
              alert("Au moins une entité est requise");
              return;
            }
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
            onSubmit={({ type, text }) => {
              setSourceType(type);
              setSourceText(text);
              setStep("ANGLES");
            }}
          />
        </details>
      )}

      {/* STEP 3 — ANGLES */}
      {sourceText && (
        <details open={step === "ANGLES"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            3. Angles
          </summary>

          <StepAngles
            sourceType={sourceType}
            sourceText={sourceText}
            context={{ topics, events, companies, persons }}
            onSelect={(angle) => {
              setSelectedAngle(angle);
              setStep("CONTENT");
            }}
          />
        </details>
      )}

      {/* STEP 4 — CONTENT */}
      {selectedAngle && (
        <details open={step === "CONTENT"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Contenu
          </summary>

          <StepContent
            angle={selectedAngle}

            // 🔑 SOURCE & CONTEXTE (NOUVEAU)
            sourceType={sourceType}
            sourceText={sourceText}
            context={{
              topics,
              events,
              companies,
              persons,
            }}

            excerpt={excerpt}
            concept={concept}
            contentBody={contentBody}

            citations={citations}
            chiffres={chiffres}
            acteurs={acteurs}

            onChange={(d) => {
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.concept !== undefined) setConcept(d.concept);
              if (d.contentBody !== undefined)
                setContentBody(d.contentBody);
              if (d.citations !== undefined)
                setCitations(d.citations);
              if (d.chiffres !== undefined)
                setChiffres(d.chiffres);
              if (d.acteurs !== undefined)
                setActeurs(d.acteurs);
            }}

            onValidate={saveContent}
          />

        </details>
      )}

      {/* STEP 5 — VISUEL */}
      {internalContentId && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            5. Visuel
          </summary>

        <StepVisual
          contentId={internalContentId}

          // 🔑 CONTEXTE VISUEL
          angleTitle={selectedAngle?.angle_title || ""}
          excerpt={excerpt}

          topics={topics}
          events={events}
          companies={companies}
          persons={persons}

          rectUrl={rectUrl}
          onUpdated={(url) => setRectUrl(url)}
          onNext={() => setStep("PREVIEW")}
        />

        </details>
      )}

      {/* STEP 6 — PREVIEW */}
      {internalContentId && (
        <details open={step === "PREVIEW"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            6. Aperçu
          </summary>

          <StepPreview
            contentId={internalContentId}
            onBack={() => setStep("CONTENT")}
            onNext={() => setStep("PUBLISH")}
          />
        </details>
      )}

      {/* STEP 7 — PUBLICATION */}
      {internalContentId && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            7. Publication
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
