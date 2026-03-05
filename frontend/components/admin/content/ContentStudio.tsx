"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import StepSource from "@/components/admin/content/steps/StepSource";
import StepSummary from "@/components/admin/content/steps/StepSummary";
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
  // STRUCTURANT
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

  // =========================
  // STATUS
  // =========================

  const [status, setStatus] = useState("DRAFT");
  const [publishing, setPublishing] = useState(false);

  const [publishMode, setPublishMode] =
    useState<"NOW" | "SCHEDULE">("NOW");
  const [publishAt, setPublishAt] = useState("");

  // ============================================================
  // LOAD EXISTING
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

      setMecanique(c.mecanique_expliquee || "");
      setEnjeu(c.enjeu_strategique || "");
      setFriction(c.point_de_friction || "");
      setSignal(c.signal_analytique || "");

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

  async function saveEditorial() {

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

    alert("Éditorial sauvegardé");

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

    alert("Validation sauvegardée");

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
        {
          publish_at:
            publishMode === "NOW"
              ? null
              : new Date(publishAt).toISOString(),
        }
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

      {/* LEFT */}

      <div className="col-span-2 space-y-12">

        {!internalContentId && (
          <StepSource
            onCreate={({ source_id, text }) => {
              setSourceId(source_id);
              setSourceText(text);
            }}
          />
        )}

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
          onNext={saveEditorial}
        />

        {internalContentId && (
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Aperçu
          </button>
        )}

      </div>

      {/* RIGHT */}

      <div className="col-span-1">
        <div className="sticky top-6 space-y-6">

          <div className="bg-white border rounded p-6 shadow-sm space-y-6">

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
            />

            <div className="border-t pt-4 space-y-4">

              <div className="text-sm">
                Statut : <strong>{status}</strong>
              </div>

              <div className="space-y-2">

                <label className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    checked={publishMode === "NOW"}
                    onChange={() => setPublishMode("NOW")}
                  />
                  Publier maintenant
                </label>

                <label className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    checked={publishMode === "SCHEDULE"}
                    onChange={() => setPublishMode("SCHEDULE")}
                  />
                  Planifier
                </label>

              </div>

              {publishMode === "SCHEDULE" && (
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="border rounded p-2 w-full text-sm"
                />
              )}

              <button
                onClick={publishContent}
                disabled={publishing}
                className="w-full px-4 py-2 bg-green-600 text-white rounded text-sm"
              >
                {publishing ? "Publication..." : "Publier"}
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* DRAWER */}

      {previewOpen && internalContentId && (
        <StepPreview
          contentId={internalContentId}
          onClose={() => setPreviewOpen(false)}
        />
      )}

    </div>

  );

}
