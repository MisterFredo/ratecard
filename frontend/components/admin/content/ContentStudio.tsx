"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import StepSummary from "@/components/admin/content/steps/StepSummary";
import StepSource from "@/components/admin/content/steps/StepSource";
import StepValidation from "@/components/admin/content/steps/StepValidation";
import StepPreview from "@/components/admin/content/steps/StepPreview";

type Mode = "create" | "edit" | "validate";

type Props = {
  mode: Mode;
  contentId?: string;
};

export default function ContentStudio({ mode, contentId }: Props) {

  const [internalContentId, setInternalContentId] =
    useState<string | null>(contentId || null);

  const [previewOpen, setPreviewOpen] = useState(false);

  // =========================
  // SOURCE
  // =========================

  const [sourceId, setSourceId] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");

  // =========================
  // LLM RAW
  // =========================

  const [topicsRaw, setTopicsRaw] = useState<string[]>([]);
  const [acteursRaw, setActeursRaw] = useState<string[]>([]);
  const [conceptsRaw, setConceptsRaw] = useState<string[]>([]);
  const [solutionsRaw, setSolutionsRaw] = useState<string[]>([]);

  // =========================
  // STRUCTURANT (SENIOR)
  // =========================

  const [topics, setTopics] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [solutions, setSolutions] = useState<string[]>([]);

  // =========================
  // EDITORIAL
  // =========================

  const [excerpt, setExcerpt] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [citations, setCitations] = useState<string[]>([]);
  const [chiffres, setChiffres] = useState<string[]>([]);

  const [mecanique, setMecanique] = useState("");
  const [enjeu, setEnjeu] = useState("");
  const [friction, setFriction] = useState("");
  const [signal, setSignal] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string>("DRAFT");

  // ============================================================
  // LOAD EXISTING CONTENT
  // ============================================================

  useEffect(() => {

    if (!contentId) return;

    async function load() {

      const res = await api.get(`/content/${contentId}`);
      const c = res.content;

      setExcerpt(c.excerpt || "");
      setContentBody(c.content_body || "");
      setCitations(c.citations || []);
      setChiffres(c.chiffres || []);

      setActeursRaw(c.acteurs_cites || []);
      setTopicsRaw(c.topics_raw || []);
      setConceptsRaw(c.concepts_raw || []);
      setSolutionsRaw(c.solutions_raw || []);

      setTopics((c.topics || []).map((x: any) => x.ID_TOPIC));
      setCompanies((c.companies || []).map((x: any) => x.ID_COMPANY));
      setConcepts((c.concepts || []).map((x: any) => x.ID_CONCEPT));
      setSolutions((c.solutions || []).map((x: any) => x.ID_SOLUTION));

      setStatus(c.status || "DRAFT");

    }

    load();

  }, [contentId]);

  // ============================================================
  // SAVE EDITORIAL
  // ============================================================

  async function saveContent() {

    const payload = {
      title: excerpt.slice(0, 120),
      excerpt,
      content_body: contentBody,
      citations,
      chiffres,
      acteurs_cites: acteursRaw,
      mecanique_expliquee: mecanique,
      enjeu_strategique: enjeu,
      point_de_friction: friction,
      signal_analytique: signal,
    };

    if (!internalContentId) {

      const res = await api.post("/content/create", payload);
      setInternalContentId(res.id_content);

    } else {

      await api.put(
        `/content/update/${internalContentId}`,
        payload
      );

    }

  }

  // ============================================================
  // SAVE STRUCTURANT
  // ============================================================

  async function saveValidation() {

    if (!internalContentId) return;

    await api.put(`/content/update/${internalContentId}`, {
      topics,
      companies,
      concepts,
      solutions,
    });

  }

  // ============================================================
  // PUBLISH
  // ============================================================

  async function publishContent() {

    if (!internalContentId) return;

    setPublishing(true);

    try {

      const res = await api.post(
        `/content/publish/${internalContentId}`,
        { publish_at: null }
      );

      setStatus(res.published_status);

    } catch (e) {
      console.error(e);
      alert("Erreur publication");
    }

    setPublishing(false);

  }

  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="grid grid-cols-3 gap-10">

      {/* ================= LEFT ================= */}

      <div className="col-span-2 space-y-12">

        {/* SOURCE */}

        {!internalContentId && (
          <StepSource
            onSubmit={({ source_id, text }) => {
              setSourceId(source_id);
              setSourceText(text);
            }}
          />
        )}

        {/* SUMMARY */}

        <StepSummary
          sourceId={sourceId}
          sourceText={sourceText}
          excerpt={excerpt}
          contentBody={contentBody}
          citations={citations}
          chiffres={chiffres}
          acteurs={acteursRaw}
          concepts={conceptsRaw}
          solutions={solutionsRaw}
          topics={topicsRaw}
          mecanique={mecanique}
          enjeu={enjeu}
          friction={friction}
          signal={signal}
          onChange={(d) => {

            if (d.excerpt !== undefined) setExcerpt(d.excerpt);
            if (d.contentBody !== undefined) setContentBody(d.contentBody);
            if (d.citations !== undefined) setCitations(d.citations);
            if (d.chiffres !== undefined) setChiffres(d.chiffres);
            if (d.acteurs !== undefined) setActeursRaw(d.acteurs);
            if (d.concepts !== undefined) setConceptsRaw(d.concepts);
            if (d.solutions !== undefined) setSolutionsRaw(d.solutions);
            if (d.topics !== undefined) setTopicsRaw(d.topics);
            if (d.mecanique !== undefined) setMecanique(d.mecanique);
            if (d.enjeu !== undefined) setEnjeu(d.enjeu);
            if (d.friction !== undefined) setFriction(d.friction);
            if (d.signal !== undefined) setSignal(d.signal);

          }}
          onNext={saveContent}
        />

        {/* PREVIEW BUTTON */}

        {internalContentId && (
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Aperçu
          </button>
        )}

      </div>

      {/* ================= RIGHT (STICKY) ================= */}

      <div className="col-span-1 sticky top-6 h-fit">

        <StepValidation
          topicsRaw={topicsRaw}
          acteursRaw={acteursRaw}
          conceptsRaw={conceptsRaw}
          solutionsRaw={solutionsRaw}
          topics={topics}
          companies={companies}
          concepts={concepts}
          solutions={solutions}
          onChange={(d) => {
            if (d.topics !== undefined) setTopics(d.topics);
            if (d.companies !== undefined) setCompanies(d.companies);
            if (d.concepts !== undefined) setConcepts(d.concepts);
            if (d.solutions !== undefined) setSolutions(d.solutions);
          }}
          onSave={saveValidation}
          onPublish={mode === "validate" ? publishContent : undefined}
        />

        <div className="mt-6 text-sm">
          Statut : <strong>{status}</strong>
        </div>

      </div>

      {/* ================= PREVIEW DRAWER ================= */}

      {previewOpen && internalContentId && (
        <StepPreview
          contentId={internalContentId}
          onClose={() => setPreviewOpen(false)}
        />
      )}

    </div>

  );

}
