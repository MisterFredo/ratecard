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
  solutions: string[];
  topics: string[];

  // 🔥 ANALYSE
  mecanique?: string;
  enjeu?: string;
  friction?: string;
  signal?: string;

  onChange: (data: {
    excerpt?: string;
    contentBody?: string;
    citations?: string[];
    chiffres?: string[];
    acteurs?: string[];
    concepts?: string[];
    solutions?: string[];
    topics?: string[];
    mecanique?: string;
    enjeu?: string;
    friction?: string;
    signal?: string;
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
  solutions,
  topics,

  mecanique = "",
  enjeu = "",
  friction = "",
  signal = "",

  onChange,
  onNext,

}: Props) {

  const [loading, setLoading] = useState(false);

  // ==========================================================
  // GENERATE (Résumé + Analyse)
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

      const res = await api.post("/content/ai/generate", payload);

      onChange({

        excerpt: res.excerpt || "",
        contentBody: res.content_body || "",

        citations: res.citations || [],
        chiffres: res.chiffres || [],

        acteurs: res.acteurs_cites || [],
        concepts: res.concepts || [],
        solutions: res.solutions || [],
        topics: res.topics || [],

        mecanique: res.mecanique_expliquee || "",
        enjeu: res.enjeu_strategique || "",
        friction: res.point_de_friction || "",
        signal: res.signal_analytique || ""

      });

    } catch (e) {

      console.error(e);
      alert("Erreur génération");

    }

    setLoading(false);

  }

  // ==========================================================
  // UTIL
  // ==========================================================

  function parseTextarea(value: string) {
    return value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-10">

      {/* GENERATE BUTTON */}

      <div className="flex items-center gap-4">
        <button
          onClick={generateSummary}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Génération..." : "Générer la synthèse & l’analyse"}
        </button>
      </div>

      {/* ========================= */}
      {/* 🔹 PARTIE EDITORIALE     */}
      {/* ========================= */}

      <div className="space-y-6">

        <h3 className="text-sm font-semibold text-gray-700">
          Éditorial
        </h3>

        {/* Résumé */}

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

        {/* Points clés */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Points clés
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[200px]"
            value={contentBody}
            onChange={(e) =>
              onChange({ contentBody: e.target.value })
            }
          />
        </div>

      </div>

      {/* ========================= */}
      {/* 🔹 EXTRACTIONS STRUCTUREES */}
      {/* ========================= */}

      <div className="border-t pt-8 space-y-6">

        <h3 className="text-sm font-semibold text-gray-700">
          Extractions LLM (à valider)
        </h3>

        {/* Citations */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Citations
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[80px]"
            value={citations.join("\n")}
            onChange={(e) =>
              onChange({
                citations: parseTextarea(e.target.value),
              })
            }
          />
        </div>

        {/* Chiffres */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Chiffres clés
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[80px]"
            value={chiffres.join("\n")}
            onChange={(e) =>
              onChange({
                chiffres: parseTextarea(e.target.value),
              })
            }
          />
        </div>

        {/* Acteurs */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Acteurs (entreprises)
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[80px]"
            value={acteurs.join("\n")}
            onChange={(e) =>
              onChange({
                acteurs: parseTextarea(e.target.value),
              })
            }
          />
        </div>

        {/* Concepts */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Concepts métier
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[80px]"
            value={concepts.join("\n")}
            onChange={(e) =>
              onChange({
                concepts: parseTextarea(e.target.value),
              })
            }
          />
        </div>

        {/* Solutions */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Solutions / Produits
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[80px]"
            value={solutions.join("\n")}
            onChange={(e) =>
              onChange({
                solutions: parseTextarea(e.target.value),
              })
            }
          />
        </div>

        {/* Topics */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Topics (1 à 3)
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[80px]"
            value={topics.join("\n")}
            onChange={(e) =>
              onChange({
                topics: parseTextarea(e.target.value),
              })
            }
          />
        </div>

      </div>

      {/* ========================= */}
      {/* 🔥 ANALYSE STRATEGIQUE   */}
      {/* ========================= */}

      <div className="border-t pt-8 space-y-6">

        <h3 className="text-sm font-semibold text-gray-700">
          Analyse stratégique
        </h3>

        <div>
          <label className="block text-sm font-medium mb-2">
            Mécanique expliquée
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[120px]"
            value={mecanique}
            onChange={(e) =>
              onChange({ mecanique: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Enjeu stratégique
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[120px]"
            value={enjeu}
            onChange={(e) =>
              onChange({ enjeu: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Point de friction
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[100px]"
            value={friction}
            onChange={(e) =>
              onChange({ friction: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Signal analytique
          </label>
          <textarea
            className="w-full border rounded p-3 min-h-[120px]"
            value={signal}
            onChange={(e) =>
              onChange({ signal: e.target.value })
            }
          />
        </div>

      </div>

      {/* NEXT */}

      <div className="pt-6">
        <button
          onClick={onNext}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Continuer vers l’aperçu
        </button>
      </div>

    </div>

  );

}
