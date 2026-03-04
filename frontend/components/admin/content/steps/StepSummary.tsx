"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  sourceType: string | null;
  sourceText: string;
  context: any;

  excerpt: string;
  contentBody: string;
  citations: string[];
  chiffres: string[];
  acteurs: string[];
  concept: string;
  conceptId: string | null;

  onChange: (data: any) => void;
  onValidate: () => void;
};

export default function StepSummary({
  sourceType,
  sourceText,
  context,

  excerpt,
  contentBody,
  citations,
  chiffres,
  acteurs,
  concept,
  conceptId,

  onChange,
  onValidate,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function generateSummary() {
    if (!sourceText?.trim()) {
      alert("Source vide");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/content/ai/summary", {
        source_type: sourceType,
        source_text: sourceText,
        context,
      });

      onChange({
        excerpt: res.excerpt,
        contentBody: res.content_body,
        citations: res.citations || [],
        chiffres: res.chiffres || [],
        acteurs: res.acteurs || [],
        concept: res.concept,
        conceptId: res.concept_id,
      });
    } catch (e) {
      console.error(e);
      alert("Erreur génération summary");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-4">
        <button
          onClick={generateSummary}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Génération..." : "Générer le summary"}
        </button>
      </div>

      {/* EXCERPT */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Excerpt (résumé court)
        </label>
        <textarea
          className="w-full border rounded p-3 min-h-[80px]"
          value={excerpt}
          onChange={(e) => onChange({ excerpt: e.target.value })}
        />
      </div>

      {/* BODY */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Body structuré
        </label>
        <textarea
          className="w-full border rounded p-3 min-h-[240px]"
          value={contentBody}
          onChange={(e) => onChange({ contentBody: e.target.value })}
        />
      </div>

      {/* CONCEPT */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Concept pivot
        </label>
        <input
          className="w-full border rounded p-3"
          value={concept}
          onChange={(e) =>
            onChange({
              concept: e.target.value,
            })
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

      <div className="pt-4">
        <button
          onClick={onValidate}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Valider le summary
        </button>
      </div>
    </div>
  );
}
