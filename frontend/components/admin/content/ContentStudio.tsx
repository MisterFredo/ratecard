"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Steps (nouveau dossier content)
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
  const [sourceText, setSourceText] = useState<string>("");

  /* =========================================================
     STATE — ANGLES
  ========================================================= */
  const [angles, setAngles] = useState<any[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<any | null>(null);

  /* =========================================================
     STATE — CONTENT
  ========================================================= */
  const [excerpt, setExcerpt] = useState("");
  const [concept, setConcept] = useState("");
  const [contentBody, setContentBody] = useState("");

  /* =========================================================
     META
  ========================================================= */
  const [internalContentId, setInternalContentId] = useState<string | null>(
    contentId || null
  );
  const [step, setStep] = useState<Step>("CONTEXT");

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
              return alert("Au moins une entité est requise");
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
            onSubmit={(s) => {
              setSourceType(s.type);
              setSourceText(s.text);
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
            excerpt={excerpt}
            concept={concept}
            contentBody={contentBody}
            onChange={(d) => {
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.concept !== undefined) setConcept(d.concept);
              if (d.contentBody !== undefined) setContentBody(d.contentBody);
            }}
            onValidate={() => {
              // create / update content viendra ici
              setStep("VISUAL");
            }}
          />
        </details>
      )}

      {/* STEP 5 — VISUAL */}
      {internalContentId && (
        <details open={step === "VISUAL"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            5. Visuel
          </summary>

          <StepVisual
            contentId={internalContentId}
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

          <StepPublish contentId={internalContentId} />
        </details>
      )}
    </div>
  );
}
