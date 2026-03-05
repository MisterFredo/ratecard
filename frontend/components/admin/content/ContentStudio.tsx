"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import StepSource from "@/components/admin/content/steps/StepSource";
import StepSummary from "@/components/admin/content/steps/StepSummary";
import StepPreview from "@/components/admin/content/steps/StepPreview";
import StepPublish from "@/components/admin/content/steps/StepPublish";

type Mode = "create" | "edit";

type Step =
  | "SOURCE"
  | "SUMMARY"
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

  // =========================
  // SOURCE
  // =========================
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");

  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);

  // =========================
  // SUMMARY
  // =========================
  const [excerpt, setExcerpt] = useState("");
  const [contentBody, setContentBody] = useState("");

  const [citations, setCitations] = useState<string[]>([]);
  const [chiffres, setChiffres] = useState<string[]>([]);
  const [acteurs, setActeurs] = useState<string[]>([]);

  // 🔥 ANALYSE
  const [mecanique, setMecanique] = useState("");
  const [enjeu, setEnjeu] = useState("");
  const [friction, setFriction] = useState("");
  const [signal, setSignal] = useState("");

  // =========================
  // PUBLISH
  // =========================
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

        setMecanique(c.mecanique_expliquee || "");
        setEnjeu(c.enjeu_strategique || "");
        setFriction(c.point_de_friction || "");
        setSignal(c.signal_analytique || "");

        setConcepts(c.concepts || []);
        setTopics(c.topics || []);
        setCompanies(c.companies || []);
        setSolutions(c.solutions || []);

        setStep("SUMMARY");

      } catch (e) {

        console.error(e);
        alert("Erreur chargement contenu");

      }

    }

    load();

  }, [mode, contentId]);

  // ============================================================
  // SAVE
  // ============================================================

  async function saveContent() {

    if (!excerpt.trim() || !contentBody.trim()) {
      alert("Summary incomplet");
      return;
    }

    setSaving(true);

    const payload = {

      title: excerpt.slice(0, 120),

      excerpt,
      content_body: contentBody,

      citations: citations || [],
      chiffres: chiffres || [],
      acteurs_cites: acteurs || [],

      // 🔥 ANALYSE
      mecanique_expliquee: mecanique,
      enjeu_strategique: enjeu,
      point_de_friction: friction,
      signal_analytique: signal,

      concepts: (concepts || [])
        .map((c) =>
          typeof c === "string"
            ? c
            : c?.ID_CONCEPT
        )
        .filter(Boolean),

      topics: (topics || [])
        .map((t) => t?.ID_TOPIC)
        .filter(Boolean),

      companies: (companies || [])
        .map((c) => c?.ID_COMPANY)
        .filter(Boolean),

      solutions: (solutions || [])
        .map((s) => s?.ID_SOLUTION)
        .filter(Boolean),

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
      alert("Merci de sélectionner une date.");
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

  return (

    <div className="space-y-6">

      <details open={step === "SOURCE"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Source
        </summary>

        <StepSource
          onSubmit={({ source_id, text, topics, companies, solutions, concepts }) => {

            setSourceId(source_id);
            setSourceText(text);

            setTopics(topics || []);
            setCompanies(companies || []);
            setSolutions(solutions || []);
            setConcepts(concepts || []);

            setStep("SUMMARY");

          }}
        />
      </details>

      {sourceText && (
        <details open={step === "SUMMARY"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            2. Synthèse & Analyse
          </summary>

          <StepSummary
            sourceId={sourceId}
            sourceText={sourceText}
            excerpt={excerpt}
            contentBody={contentBody}
            citations={citations}
            chiffres={chiffres}
            acteurs={acteurs}
            concepts={
              concepts.map((c) =>
                typeof c === "string" ? c : c?.TITLE
              )
            }
            mecanique={mecanique}
            enjeu={enjeu}
            friction={friction}
            signal={signal}
            onChange={(d) => {
              if (d.excerpt !== undefined) setExcerpt(d.excerpt);
              if (d.contentBody !== undefined) setContentBody(d.contentBody);
              if (d.citations !== undefined) setCitations(d.citations);
              if (d.chiffres !== undefined) setChiffres(d.chiffres);
              if (d.acteurs !== undefined) setActeurs(d.acteurs);
              if (d.mecanique !== undefined) setMecanique(d.mecanique);
              if (d.enjeu !== undefined) setEnjeu(d.enjeu);
              if (d.friction !== undefined) setFriction(d.friction);
              if (d.signal !== undefined) setSignal(d.signal);
            }}
            onNext={saveContent}
          />
        </details>
      )}

      {internalContentId && (
        <details open={step === "PREVIEW"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            3. Aperçu
          </summary>

          <StepPreview
            contentId={internalContentId}
            onBack={() => setStep("SUMMARY")}
            onNext={() => setStep("PUBLISH")}
          />
        </details>
      )}

      {internalContentId && (
        <details open={step === "PUBLISH"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Publication
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
