"use client";

import { useState } from "react";
import { api } from "@/lib/api";

// STEPS
import StepTitle from "@/components/admin/synthesis/steps/StepTitle";
import StepModel from "@/components/admin/synthesis/steps/StepModel";
import StepPeriod from "@/components/admin/synthesis/steps/StepPeriod";
import StepType from "@/components/admin/synthesis/steps/StepType";
import StepSelection from "@/components/admin/synthesis/steps/StepSelection";
import StepPreview from "@/components/admin/synthesis/steps/StepPreview";

// DRAWER
import AnalysisDrawerAdmin from "@/components/drawers/AnalysisDrawerAdmin";

type Step =
  | "TITLE"       // 👈 STEP 0
  | "MODEL"
  | "PERIOD"
  | "TYPE"
  | "SELECTION"
  | "PREVIEW";

export default function SynthesisStudio() {
  /* =========================================================
     STATE — FLOW
  ========================================================= */
  const [step, setStep] = useState<Step>("TITLE");

  /* =========================================================
     STATE — TITLE (STEP 0)
  ========================================================= */
  const [title, setTitle] = useState<string>("");

  /* =========================================================
     STATE — CONFIG
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
     UTILS — DEFAULT TITLE
  ========================================================= */
  function buildDefaultTitle() {
    if (!model || !synthesisType || !dateFrom || !dateTo) return "";

    const typeLabel =
      synthesisType === "CHIFFRES"
        ? "Synthèse chiffrée"
        : synthesisType === "ANALYTIQUE"
        ? "Panorama analytique"
        : "Cartographie";

    return `${model.name} — ${typeLabel} (${dateFrom} → ${dateTo})`;
  }

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

      const res = await api.post("/synthesis/candidates", payload);

      // backend renvoie { status, contents }
      setCandidates(res.contents || []);
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
      !title.trim() ||
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
      const res = await api.post("/synthesis/create", {
        title, // 👈 TITRE OPÉRATIONNEL
        id_model: model.id_model,
        synthesis_type: synthesisType,
        date_from: dateFrom,
        date_to: dateTo,
      });

      const id = res.id_synthesis;
      setInternalSynthesisId(id);

      await api.post(`/synthesis/${id}/contents`, {
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
      {/* STEP 0 — TITLE */}
      <details open={step === "TITLE"} className="border rounded p-4">
        <summary className="font-semibold cursor-pointer">
          0. Titre
        </summary>
        <StepTitle
          title={title}
          onChange={setTitle}
          onValidate={() => setStep("MODEL")}
        />
      </details>

      {/* STEP 1 — MODEL */}
      {step !== "TITLE" && (
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
      )}

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

              // Préremplissage automatique du titre si vide
              if (!title.trim()) {
                setTitle(buildDefaultTitle());
              }

              loadCandidates();
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

      {/* DRAWER ANALYSE */}
      {openAnalysisId && (
        <AnalysisDrawerAdmin
          contentId={openAnalysisId}
          onClose={() => setOpenAnalysisId(null)}
        />
      )}
    </div>
  );
}
