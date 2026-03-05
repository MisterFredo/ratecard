"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {

  sourceId: string | null;
  sourceText: string;

  excerpt: string;
  contentBody: string;

  citations: string[];
  chiffres: string[];
  acteurs: string[];
  concepts: string[];

  onChange: (data: {
    excerpt?: string;
    contentBody?: string;
    citations?: string[];
    chiffres?: string[];
    acteurs?: string[];
    concepts?: string[];
  }) => void;

  onNext: () => void;
};

export default function StepSummary({

  sourceId,
  sourceText,

  excerpt,
  contentBody,
  citations,
  chiffres,
  acteurs,
  concepts,

  onChange,
  onNext,

}: Props) {

  const [loading, setLoading] = useState(false);


  // ==========================================================
  // GENERATE SUMMARY
  // ==========================================================

  async function generateSummary() {

    if (!sourceText?.trim()) {
      alert("Source vide");
      return;
    }

    setLoading(true);

    try {

      const payload: any = {
        source_text: sourceText
      };

      if (sourceId) {
        payload.source_id = sourceId;
      }

      const res = await api.post("/content/ai/summary", payload);

      onChange({

        excerpt: res.excerpt || "",
        contentBody: res.content_body || "",

        citations: res.citations || [],
        chiffres: res.chiffres || [],
        acteurs: res.acteurs_cites || [],
        concepts: res.concepts || []

      });

    } catch (e) {

      console.error(e);
      alert("Erreur génération summary");

    }

    setLoading(false);

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-6">

      {/* GENERATE */}

      <div className="flex items-center gap-4">

        <button
          onClick={generateSummary}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Génération..." : "Générer la synthèse"}
        </button>

      </div>


      {/* EXCERPT */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Résumé exécutif
        </label>

        <textarea
          className="w-full border rounded p-3 min-h-[80px]"
          value={excerpt}
          onChange={(e) =>
            onChange({ excerpt: e.target.value })
          }
        />

      </div>


      {/* BODY */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Points clés
        </label>

        <textarea
          className="w-full border rounded p-3 min-h-[240px]"
          value={contentBody}
          onChange={(e) =>
            onChange({ contentBody: e.target.value })
          }
        />

      </div>


      {/* CITATIONS */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Citations
        </label>

        <textarea
          className="w-full border rounded p-3 min-h-[80px]"
          value={citations.join("\n")}
          onChange={(e) =>
            onChange({
              citations: e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
        />

      </div>


      {/* CHIFFRES */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Chiffres clés
        </label>

        <textarea
          className="w-full border rounded p-3 min-h-[80px]"
          value={chiffres.join("\n")}
          onChange={(e) =>
            onChange({
              chiffres: e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
        />

      </div>


      {/* ACTEURS */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Acteurs cités
        </label>

        <textarea
          className="w-full border rounded p-3 min-h-[80px]"
          value={acteurs.join("\n")}
          onChange={(e) =>
            onChange({
              acteurs: e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
        />

      </div>


      {/* CONCEPTS */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Concepts suggérés
        </label>

        <textarea
          className="w-full border rounded p-3 min-h-[80px]"
          value={concepts.join("\n")}
          onChange={(e) =>
            onChange({
              concepts: e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
        />

      </div>


      {/* NEXT */}

      <div className="pt-4">

        <button
          onClick={onNext}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Continuer vers le contexte
        </button>

      </div>

    </div>

  );

}
