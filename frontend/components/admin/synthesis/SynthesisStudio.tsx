"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// STEPS
import StepModel from "@/components/admin/synthesis/steps/StepModel";
import StepPeriod from "@/components/admin/synthesis/steps/StepPeriod";
import StepType from "@/components/admin/synthesis/steps/StepType";
import StepCandidates from "@/components/admin/synthesis/steps/StepCandidates";
import StepSelection from "@/components/admin/synthesis/steps/StepSelection";
import StepPreview from "@/components/admin/synthesis/steps/StepPreview";

// DRAWER ADMIN
import AnalysisDrawerAdmin from "@/components/drawers/AnalysisDrawerAdmin";

type Mode = "create" | "edit";

type Step =
  | "MODEL"
  | "PERIOD"
  | "TYPE"
  | "CANDIDATES"
  | "SELECTION"
  | "PREVIEW";

type Props = {
  mode?: Mode;
  synthesisId?: string;
};

export default function SynthesisStudio({
  mode = "create",
  synthesisId,
}: Props) {
  /* =========================================================
     STATE — MODE & STEP
  ========================================================= */
  const [step, setStep] = useState<Step>("MODEL");

  /* =========================================================
     STATE — MODEL
  ========================================================= */
  const [model, setModel] = useState<any | null>(null);

  /* =========================================================
     STATE — PERIOD
  ========================================================= */
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  /* =========================================================
     STATE — TYPE
  ========================================================= */
  const [synthesisType, setSynthesisType] = useState<
    "CHIFFRES" | "ANALYTIQUE" | "CARTOGRAPHIE" | null
  >(null);

  /* =========================================================
     STATE — CANDIDATES & SELECTION
  ========================================================= */
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);

  /* =========================================================
     STATE — SYNTHESIS
  ========================================================= */
  const [internalSynthesisId, setInternalSynthesisId] =
    useState<string | null>(synthesisId || null);

  /* =========================================================
     STATE — DRAWER ADMIN
  ========================================================= */
  const [openAnalysisId, setOpenAnalysisId] =
    useState<string | null>(null);

  /* =========================================================
     LOAD SYNTHESIS (EDIT MODE)
  ========================================================= */
  useEffect(() => {
    if (mode !== "edit" || !synthesisId) return;

    async function load() {
      try {
        setInternalSynthesisId(synthesisId);
        setStep("PREVIEW");
      } catch (e) {
        console.error(e);
        alert("Erreur chargement synthèse");
      }
    }

    load();
  }, [mode, synthesisId]);

  /* =========================================================
     CREATE SYNTHESIS
  ========================================================= */
  async function createSynthesis() {
    if (!model || !synthesisType || !dateFrom || !dateTo) {
      alert("Informations manquantes pour créer la synthèse");
      return;
    }

    try {
      const res = await api.post("/synthesis/create", {
        id_model: model.id_model,
        synthesis_type: synthesisType,
        date_from: dateFrom,
        date_to: dateTo,
      });

      setInternalSynthesisId(res.id_synthesis);
      setStep("CANDIDATES");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création synthèse");
    }
  }

  /* =========================================================
     LOAD CANDIDATES
  ========================================================= */
  async function loadCandidates() {
    if (!model || !dateFrom || !dateTo) return;

    try {
      const res = await api.post("/synthesis/candidates", {
        topic_ids: model.topic_ids || [],
        company_ids: model.company_ids || [],
        date_from: dateFrom,
        date_to: dateTo,
      });

      setCandidates(res.contents || []);
      setStep("SELECTION");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur chargement analyses candidates");
    }
  }

  /* =========================================================
     ATTACH CONTENTS
  ========================================================= */
  async function attachContents() {
    if (!internalSynthesisId) return;

    if (selectedContentIds.length === 0) {
      alert("Sélectionnez au moins une analyse");
      return;
    }

    try {
      await api.post(
        `/synthesis/${internalSynthesisId}/contents`,
        {
          content_ids: selectedContentIds,
        }
      );

      setStep("PREVIEW");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur association contenus");
    }
  }

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div className="space-y-6">
      {/* STEP 1 — MODEL */}
      <details open={step === "MODEL"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          1. Modèle
        </summary>

        <StepModel
          model={model}
          onSelect={(m) => {
            setModel(m);
            setStep("PERIOD");
          }}
        />
      </details>

      {/* STEP 2 — PERIOD */}
      {model && (
        <details open={step === "PERIOD"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            2. Période
          </summary>

          <StepPeriod
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={(d) => {
              if (d.dateFrom !== undefined)
                setDateFrom(d.dateFrom);
              if (d.dateTo !== undefined) setDateTo(d.dateTo);
            }}
            onValidate={() => setStep("TYPE")}
          />
        </details>
      )}

      {/* STEP 3 — TYPE */}
      {dateFrom && dateTo && (
        <details open={step === "TYPE"} className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            3. Type de synthèse
          </summary>

          <StepType
            type={synthesisType}
            onSelect={(t) => {
              setSynthesisType(t);
              createSynthesis();
            }}
          />
        </details>
      )}

      {/* STEP 4 — CANDIDATES */}
      {internalSynthesisId && (
        <details
          open={step === "CANDIDATES"}
          className="border rounded p-4"
        >
          <summary className="font-semibold cursor-pointer">
            4. Analyses candidates
          </summary>

          <StepCandidates
            candidates={candidates}
            onLoad={loadCandidates}
            onValidate={() => setStep("SELECTION")}
            onOpenAnalysis={(id) => setOpenAnalysisId(id)}
          />
        </details>
      )}

      {/* STEP 5 — SELECTION */}
      {candidates.length > 0 && (
        <details
          open={step === "SELECTION"}
          className="border rounded p-4"
        >
          <summary className="font-semibold cursor-pointer">
            5. Sélection
          </summary>

          <StepSelection
            candidates={candidates}
            selectedIds={selectedContentIds}
            onChange={setSelectedContentIds}
            onValidate={attachContents}
            onOpenAnalysis={(id) => setOpenAnalysisId(id)}
          />
        </details>
      )}

      {/* STEP 6 — PREVIEW */}
      {internalSynthesisId && (
        <details
          open={step === "PREVIEW"}
          className="border rounded p-4"
        >
          <summary className="font-semibold cursor-pointer">
            6. Aperçu
          </summary>

          <StepPreview
            synthesisId={internalSynthesisId}
            onBack={() => setStep("SELECTION")}
          />
        </details>
      )}

      {/* DRAWER ADMIN */}
      {openAnalysisId && (
        <AnalysisDrawerAdmin
          contentId={openAnalysisId}
          onClose={() => setOpenAnalysisId(null)}
        />
      )}
    </div>
  );
}
