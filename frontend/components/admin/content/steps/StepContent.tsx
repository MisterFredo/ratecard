"use client";

import { useState } from "react";
import ContentContentBlock from "@/components/admin/content/ContentContentBlock";
import { api } from "@/lib/api";

type Props = {
  angle: {
    angle_title: string;
    angle_signal: string;
    concept: string;
    concept_id: string;
  };

  sourceType: string | null;
  sourceText: string;
  context: {
    topics: any[];
    events: any[];
    companies: any[];
  };

  excerpt: string;
  concept: string;
  contentBody: string;

  citations: string[];
  chiffres: string[];
  acteurs: string[];

  onChange: (data: {
    excerpt?: string;
    concept?: string;
    contentBody?: string;
    citations?: string[];
    chiffres?: string[];
    acteurs?: string[];
  }) => void;

  onValidate: () => void;
};

export default function StepContent({
  angle,
  sourceType,
  sourceText,
  context,
  excerpt,
  concept,
  contentBody,
  citations,
  chiffres,
  acteurs,
  onChange,
  onValidate,
}: Props) {
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // IA GENERATION (PIVOT CONCEPT VERROUILLÉ)
  // ==========================================================
  async function generateViaIA() {
    if (!angle?.concept) {
      alert("Concept pivot requis");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/content/ai/generate", {
        source_type: sourceType,
        source_text: sourceText,

        angle_title: angle.angle_title,
        angle_signal: angle.angle_signal,

        // 🔥 pivot obligatoire
        concept: angle.concept,

        context: {
          topics: context.topics.map((t) => t.id_topic),
          events: context.events.map((e) => e.id_event),
          companies: context.companies.map((c) => c.id_company),
        },
      });

      if (res?.content) {
        onChange({
          excerpt: res.content.excerpt || "",
          concept: res.content.concept || angle.concept,
          contentBody: res.content.content_body || "",
          citations: res.content.citations || [],
          chiffres: res.content.chiffres || [],
          acteurs: res.content.acteurs || [],
        });
      }
    } catch (e) {
      console.error(e);
      alert("❌ Erreur génération IA");
    }

    setLoading(false);
  }

  // ==========================================================
  // EDIT LIST HELPERS
  // ==========================================================
  function updateList(
    key: "citations" | "chiffres" | "acteurs",
    index: number,
    value: string
  ) {
    const map = { citations, chiffres, acteurs };
    const list = [...map[key]];
    list[index] = value;
    onChange({ [key]: list });
  }

  function removeItem(
    key: "citations" | "chiffres" | "acteurs",
    index: number
  ) {
    const map = { citations, chiffres, acteurs };
    const list = [...map[key]].filter((_, i) => i !== index);
    onChange({ [key]: list });
  }

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <div className="space-y-6">
      {/* ANGLE CONTEXT */}
      <div className="border rounded p-3 bg-gray-50">
        <p className="text-sm font-medium text-gray-700">
          Angle sélectionné
        </p>

        <p className="font-semibold text-ratecard-blue">
          {angle.angle_title}
        </p>

        <p className="text-sm text-gray-600 mt-1">
          {angle.angle_signal}
        </p>

        <p className="text-xs text-gray-400 mt-2">
          Concept pivot : {angle.concept}
        </p>
      </div>

      {/* CONTENU PRINCIPAL */}
      <ContentContentBlock
        excerpt={excerpt}
        concept={concept}
        contentBody={contentBody}
        onChange={onChange}
      />

      {/* AIDES ÉDITORIALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CITATIONS */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">
            Citations proposées
          </h4>

          {citations.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              Aucune
            </p>
          )}

          {citations.map((c, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                className="border rounded p-2 w-full text-sm"
                value={c}
                onChange={(e) =>
                  updateList("citations", i, e.target.value)
                }
              />
              <button
                onClick={() => removeItem("citations", i)}
                className="text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* CHIFFRES */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">
            Chiffres clés
          </h4>

          {chiffres.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              Aucun
            </p>
          )}

          {chiffres.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="border rounded p-2 w-full text-sm"
                value={c}
                onChange={(e) =>
                  updateList("chiffres", i, e.target.value)
                }
              />
              <button
                onClick={() => removeItem("chiffres", i)}
                className="text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ACTEURS */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">
            Acteurs cités
          </h4>

          {acteurs.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              Aucun
            </p>
          )}

          {acteurs.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="border rounded p-2 w-full text-sm"
                value={a}
                onChange={(e) =>
                  updateList("acteurs", i, e.target.value)
                }
              />
              <button
                onClick={() => removeItem("acteurs", i)}
                className="text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={generateViaIA}
          disabled={loading}
          className="border border-ratecard-blue text-ratecard-blue px-4 py-2 rounded"
        >
          {loading ? "Génération…" : "Générer via IA"}
        </button>

        <button
          onClick={onValidate}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          Valider le contenu
        </button>
      </div>
    </div>
  );
}
