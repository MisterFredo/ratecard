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
  solutions?: string[];

  // 🔥 NOUVEAUX CHAMPS ANALYTIQUES
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
  solutions = [],

  mecanique = "",
  enjeu = "",
  friction = "",
  signal = "",

  onChange,
  onNext,

}: Props) {

  const [loading, setLoading] = useState(false);

  // ==========================================================
  // GENERATE (Résumé + Analyse en une passe)
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

        // 🔥 ANALYSE
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

  return (

    <div className="space-y-8">

      {/* GENERATE */}

      <div className="flex items-center gap-4">
        <button
          onClick={generateSummary}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Génération..." : "Générer la synthèse & l’analyse"}
        </button>
      </div>

      {/* RESUME EXECUTIF */}

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

      {/* POINTS CLES */}

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

      {/* EXTRACTIONS STRUCTUREES */}

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

      {/* 🔥 BLOC ANALYTIQUE */}

      <div className="border-t pt-6 space-y-6">

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

      <div className="pt-4">
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
