"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// STEPS
import StepModel from "@/components/admin/synthesis/steps/StepModel";
import StepPeriod from "@/components/admin/synthesis/steps/StepPeriod";
import StepType from "@/components/admin/synthesis/steps/StepType";
import StepSelection from "@/components/admin/synthesis/steps/StepSelection";
import StepPreview from "@/components/admin/synthesis/steps/StepPreview";

// DRAWER ADMIN
import AnalysisDrawerAdmin from "@/components/drawers/AnalysisDrawerAdmin";

type Mode = "create" | "edit";

type Step =
  | "MODEL"
  | "PERIOD"
  | "TYPE"
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
     STATE — STEP
  ========================================================= */
  const [step, setStep] = useState<Step>("MODEL");

  /* =========================================================
     STATE — MODEL / PERIOD / TYPE
  ========================================================= */
  const [model, setModel] = useState<any | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [synthesisType, setSynthesisType] = useState<
    "CHIFFRES" | "ANALYTIQUE" | "CARTOGRAPHIE" | null
  >(null);

  /* =========================================================
     STATE — DATA
  ========================================================= */
  const [internalSynthesisId, setInternalSynthesisId] =
    useState<string | null>(synthesisId || null);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);

  /* =========================================================
     STATE — DRAWER
  ========================================================= */
  const [openAnalysisId, setOpenAnalysisId] =
    useState<string | null>(null);

  /* =========================================================
     LOAD SYNTHESIS (EDIT MODE)
  ========================================================= */
  useEffect(() => {
    if (mode !== "edit" || !synthesisId) return;
    setInternalSynthesisId(synthesisId);
    setStep("PREVIEW");
  }, [mode, synthesisId]);

  /* =========================================================
     CREATE SYNTHESIS + LOAD ANALYSES
  ========================================================= */
  async function createSynthesisAndLoad() {
    if (!model || !synthesisType || !dateFrom || !dateTo) {
      alert("Informations manquantes pour créer la synthèse");
      return;
    }

    try {
      // 1️⃣ create synthesis
      const createRes = await api.post("/synthesis/create", {
        id_model: model.id_model,
        synthesis_type: synthesisType,
        date_from: dateFrom,
        date_to: dateTo,
      });

      const newId = createRes.id_synthesis;
      setInternalSynthesisId(newId);

      // 2️⃣ load analyses
      const candidatesRes = await api.post("/synthesis/candidates", {
        topic_ids: model.topic_ids || [],
        company_ids: model.company_ids || [],
        date_from: dateFrom,
        date_to: dateTo,
      });

      setCandidates(candidatesRes.contents || []);
      setStep("SELECTION");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création synthèse");
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
        { content_ids: selectedContentIds }
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
              if (d.dateTo !== undefined)
                setDateTo(d.dateTo);
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
              createSynthesisAndLoad();
            }}
          />
        </details>
      )}

      {/* STEP 4 — SELECTION */}
      {step === "SELECTION" && (
        <details open className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Sélection
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

      {/* STEP 5 — PREVIEW */}
      {step === "PREVIEW" && internalSynthesisId && (
        <details open className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            5. Aperçu
          </summary>
          <StepPreview
            synthesisId={internalSynthesisId}
            onBack={() => setStep("SELECTION")}
          />
        </details>
      )}

      {/* DRAWER */}
      {openAnalysisId && (
        <AnalysisDrawerAdmin
          contentId={openAnalysisId}
          onClose={() => setOpenAnalysisId(null)}
        />
      )}
    </div>
  );
}
