"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// STEPS
import StepModel from "@/components/admin/synthesis/steps/StepModel";
import StepPeriod from "@/components/admin/synthesis/steps/StepPeriod";
import StepType from "@/components/admin/synthesis/steps/StepType";
import StepSelection from "@/components/admin/synthesis/steps/StepSelection";
import StepPreview from "@/components/admin/synthesis/steps/StepPreview";

// DRAWER
import AnalysisDrawerAdmin from "@/components/drawers/AnalysisDrawerAdmin";

type Step =
  | "MODEL"
  | "PERIOD"
  | "TYPE"
  | "SELECTION"
  | "PREVIEW";

export default function SynthesisStudio() {
  /* =========================================================
     STATE — FLOW
  ========================================================= */
  const [step, setStep] = useState<Step>("MODEL");

  /* =========================================================
     STATE — CONFIG (STRING ONLY)
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
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [internalSynthesisId, setInternalSynthesisId] =
    useState<string | null>(null);

  /* =========================================================
     STATE — DRAWER
  ========================================================= */
  const [openAnalysisId, setOpenAnalysisId] =
    useState<string | null>(null);

  /* =========================================================
     LOAD CANDIDATES (LECTURE PURE)
  ========================================================= */
  async function loadCandidates() {
    if (!model || !dateFrom || !dateTo) {
      alert("Informations manquantes pour charger les analyses");
      return;
    }

    try {
      const payload = {
        topic_ids: model.topic_ids || [],
        company_ids: model.company_ids || [],
        date_from: dateFrom,
        date_to: dateTo,
      };

      console.log("CANDIDATES PAYLOAD", payload);

      const res = await api.post("/synthesis/candidates", payload);

      // 🔑 FIX CLÉ : lecture robuste du wrapper api
      const contents =
        res?.contents ??
        res?.data?.contents ??
        [];

      console.log("CANDIDATES RESPONSE", contents);

      setCandidates(contents);
      setStep("SELECTION");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur chargement analyses candidates");
    }
  }

  /* =========================================================
     CREATE SYNTHESIS (FINAL)
  ========================================================= */
  async function createSynthesis() {
    if (
      !model ||
      !synthesisType ||
      !dateFrom ||
      !dateTo ||
      selectedContentIds.length === 0
    ) {
      alert("Informations manquantes pour créer la synthèse");
      return;
    }

    try {
      const createRes = await api.post("/synthesis/create", {
        id_model: model.id_model,
        synthesis_type: synthesisType,
        date_from: dateFrom,
        date_to: dateTo,
      });

      const newId =
        createRes?.id_synthesis ??
        createRes?.data?.id_synthesis;

      if (!newId) {
        throw new Error("ID synthèse introuvable");
      }

      setInternalSynthesisId(newId);

      await api.post(`/synthesis/${newId}/contents`, {
        content_ids: selectedContentIds,
      });

      setStep("PREVIEW");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création synthèse");
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
                setDateFrom(String(d.dateFrom));
              if (d.dateTo !== undefined)
                setDateTo(String(d.dateTo));
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
              loadCandidates(); // 🔥 lecture uniquement
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
            onValidate={createSynthesis}
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
