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
     STATE — STEP
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

    setInternalSynthesisId(synthesisId);
    setStep("PREVIEW");
  }, [mode, synthesisId]);

  /* =========================================================
     CREATE SYNTHESIS + LOAD CANDIDATES (ATOMIC)
  ========================================================= */
  async function createSynthesisAndLoadCandidates() {
    if (!model || !synthesisType || !dateFrom || !dateTo) {
      alert("Informations manquantes pour créer la synthèse");
      return;
    }

    try {
      // 1) Création de la synthèse
      const createRes = await api.post("/synthesis/create", {
        id_model: model.id_model,
        synthesis_type: synthesisType,
        date_from: dateFrom,
        date_to: dateTo,
      });

      const newId = createRes.id_synthesis;
      setInternalSynthesisId(newId);

      // 2) Chargement des analyses candidates
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
     TRIGGER CREATION WHEN STEP === CANDIDATES
  ========================================================= */
  useEffect(() => {
    if (step === "CANDIDATES") {
      createSynthesisAndLoadCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
              setStep("CANDIDATES");
            }}
          />
        </details>
      )}

      {/* STEP 4 — CANDIDATES (LOADING STATE) */}
      {step === "CANDIDATES" && (
        <details open className="border rounded p-4">
          <summary className="font-semibold cursor-pointer">
            4. Analyses candidates
          </summary>

          <p className="text-sm text-gray-500">
            Chargement des analyses…
          </p>
        </details>
      )}

      {/* STEP 5 — SELECTION */}
      {step === "SELECTION" && (
        <details open className="border rounded p-4">
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
      {step === "PREVIEW" && internalSynthesisId && (
        <details open className="border rounded p-4">
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
