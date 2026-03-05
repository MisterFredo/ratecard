"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import EditableList from "@/components/admin/content/steps/EditableList";
import MultiSelectTopics from "@/components/admin/content/steps/MultiSelectTopics";

type Topic = {
  ID_TOPIC: string;
  LABEL: string;
};

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

  mecanique: string;
  enjeu: string;
  friction: string;
  signal: string;

  onChange: (data: any) => void;
  onNext: () => void;
};

export default function StepSummary(props: Props) {

  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================================
  // LOAD TOPICS (13 → small volume)
  // =========================================

  useEffect(() => {
    async function loadTopics() {
      const res = await api.get("/topic/list");
      setAllTopics(res.topics || []);
    }
    loadTopics();
  }, []);

  // =========================================
  // NORMALIZATION HELPERS
  // =========================================

  function normalizeList(input: any): string[] {

    if (!input) return [];

    if (Array.isArray(input)) {
      return input
        .flatMap((item) =>
          typeof item === "string"
            ? item.split(/[,;\n]/)
            : []
        )
        .map((x) => x.trim())
        .filter(Boolean);
    }

    if (typeof input === "string") {
      return input
        .split(/[,;\n]/)
        .map((x) => x.trim())
        .filter(Boolean);
    }

    return [];
  }

  function normalizePoints(input: string): string[] {
    if (!input) return [];

    return input
      .replace(/<\/?ul>/g, "")
      .replace(/<\/?li>/g, "\n")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  // =========================================
  // GENERATE (LLM)
  // =========================================

  async function generate() {

    if (!props.sourceText?.trim()) return;

    setLoading(true);

    try {

      const res = await api.post("/content/ai/generate", {
        source_text: props.sourceText,
        source_id: props.sourceId,
      });

      props.onChange({
        excerpt: res.excerpt || "",
        contentBody: (normalizeList(res.content_body) || []).join("\n"),

        citations: normalizeList(res.citations),
        chiffres: normalizeList(res.chiffres),

        acteurs: normalizeList(res.acteurs_cites),
        concepts: normalizeList(res.concepts),
        solutions: normalizeList(res.solutions),
        topics: res.topics || [],

        mecanique: res.mecanique_expliquee || "",
        enjeu: res.enjeu_strategique || "",
        friction: res.point_de_friction || "",
        signal: res.signal_analytique || "",
      });

    } catch (e) {
      console.error(e);
      alert("Erreur génération");
    }

    setLoading(false);
  }

  // =========================================
  // RENDER
  // =========================================

  return (

    <div className="space-y-10">

      {/* GENERATION */}

      <button
        onClick={generate}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Génération..." : "Générer synthèse & analyse"}
      </button>

      {/* ========================================= */}
      {/* ÉDITORIAL */}
      {/* ========================================= */}

      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-gray-700">
          Éditorial
        </h3>

        <div>
          <label className="block text-sm font-medium mb-2">
            Résumé exécutif
          </label>
          <textarea
            value={props.excerpt}
            onChange={(e) =>
              props.onChange({ excerpt: e.target.value })
            }
            className="w-full border rounded p-3 min-h-[80px]"
          />
        </div>

        <EditableList
          label="Points clés"
          items={normalizePoints(props.contentBody)}
          onChange={(items) =>
            props.onChange({
              contentBody: items.join("\n"),
            })
          }
        />

      </div>

      {/* ========================================= */}
      {/* EXTRACTIONS LLM */}
      {/* ========================================= */}

      <div className="space-y-6">

        <h3 className="text-sm font-semibold text-gray-700">
          Extractions LLM
        </h3>

        <MultiSelectTopics
          topics={allTopics}
          selected={props.topics}
          onChange={(ids) =>
            props.onChange({ topics: ids })
          }
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Points clés
          </label>
          <textarea
            value={props.contentBody}
            onChange={(e) =>
              props.onChange({ contentBody: e.target.value })
            }
            className="w-full border rounded p-3 min-h-[200px]"
          />
        </div>

        <EditableList
          label="Concepts"
          items={props.concepts}
          onChange={(items) =>
            props.onChange({ concepts: items })
          }
        />

        <EditableList
          label="Solutions"
          items={props.solutions}
          onChange={(items) =>
            props.onChange({ solutions: items })
          }
        />

        <EditableList
          label="Citations"
          items={props.citations}
          onChange={(items) =>
            props.onChange({ citations: items })
          }
        />

        <EditableList
          label="Chiffres clés"
          items={props.chiffres}
          onChange={(items) =>
            props.onChange({ chiffres: items })
          }
        />

      </div>

      {/* ========================================= */}
      {/* ANALYSE STRATÉGIQUE */}
      {/* ========================================= */}

      <div className="space-y-6 border-t pt-6">

        <h3 className="text-sm font-semibold text-gray-700">
          Analyse stratégique
        </h3>

        <div>
          <label className="block text-sm font-medium mb-2">
            Mécanique expliquée
          </label>
          <textarea
            value={props.mecanique}
            onChange={(e) =>
              props.onChange({ mecanique: e.target.value })
            }
            className="w-full border rounded p-3 min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Enjeu stratégique
          </label>
          <textarea
            value={props.enjeu}
            onChange={(e) =>
              props.onChange({ enjeu: e.target.value })
            }
            className="w-full border rounded p-3 min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Point de friction
          </label>
          <textarea
            value={props.friction}
            onChange={(e) =>
              props.onChange({ friction: e.target.value })
            }
            className="w-full border rounded p-3 min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Signal analytique
          </label>
          <textarea
            value={props.signal}
            onChange={(e) =>
              props.onChange({ signal: e.target.value })
            }
            className="w-full border rounded p-3 min-h-[100px]"
          />
        </div>

      </div>

      {/* ACTION */}

      <button
        onClick={props.onNext}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Sauvegarder & Aperçu
      </button>

    </div>
  );
}
