"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import EditableList from "@/components/admin/content/steps/EditableList";
import EditableList from "@/components/admin/content/steps/MultiSelectTopics";

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

  useEffect(() => {
    async function loadTopics() {
      const res = await api.get("/topic/list");
      setAllTopics(res.topics || []);
    }
    loadTopics();
  }, []);

  async function generate() {

    if (!props.sourceText?.trim()) return;

    setLoading(true);

    const res = await api.post("/content/ai/generate", {
      source_text: props.sourceText,
      source_id: props.sourceId,
    });

    props.onChange({
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
      signal: res.signal_analytique || "",
    });

    setLoading(false);
  }

  return (

    <div className="space-y-8">

      <button
        onClick={generate}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Génération..." : "Générer"}
      </button>

      {/* Résumé */}

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

      {/* Points clés */}

      <EditableList
        label="Points clés"
        items={props.contentBody
          .replace(/<\/?ul>/g, "")
          .replace(/<\/?li>/g, "\n")
          .split("\n")
          .filter(Boolean)}
        onChange={(items) =>
          props.onChange({
            contentBody: items.join("\n"),
          })
        }
      />

      {/* Topics */}

      <MultiSelectTopics
        topics={allTopics}
        selected={props.topics}
        onChange={(ids) =>
          props.onChange({ topics: ids })
        }
      />

      {/* Citations */}

      <EditableList
        label="Citations"
        items={props.citations}
        onChange={(items) =>
          props.onChange({ citations: items })
        }
      />

      {/* Chiffres */}

      <EditableList
        label="Chiffres clés"
        items={props.chiffres}
        onChange={(items) =>
          props.onChange({ chiffres: items })
        }
      />

      {/* Analyse */}

      <div className="border-t pt-6 space-y-4">

        <textarea
          value={props.mecanique}
          onChange={(e) =>
            props.onChange({ mecanique: e.target.value })
          }
          placeholder="Mécanique"
          className="w-full border rounded p-3 min-h-[100px]"
        />

        <textarea
          value={props.enjeu}
          onChange={(e) =>
            props.onChange({ enjeu: e.target.value })
          }
          placeholder="Enjeu"
          className="w-full border rounded p-3 min-h-[100px]"
        />

        <textarea
          value={props.friction}
          onChange={(e) =>
            props.onChange({ friction: e.target.value })
          }
          placeholder="Friction"
          className="w-full border rounded p-3 min-h-[80px]"
        />

        <textarea
          value={props.signal}
          onChange={(e) =>
            props.onChange({ signal: e.target.value })
          }
          placeholder="Signal"
          className="w-full border rounded p-3 min-h-[100px]"
        />

      </div>

      <button
        onClick={props.onNext}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Sauvegarder & Aperçu
      </button>

    </div>

  );

}
