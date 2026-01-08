"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type SourceType =
  | "LINKEDIN_POST"
  | "PRESS_RELEASE"
  | "ARTICLE"
  | "INTERVIEW"
  | "OTHER";

type Props = {
  onGenerated: (data: {
    title: string;
    excerpt: string;
    body: string;
  }) => void;

  onSkip: () => void;
};

export default function NewsStepSource({
  onGenerated,
  onSkip,
}: Props) {
  const [sourceType, setSourceType] =
    useState<SourceType>("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!sourceText.trim()) {
      setError("Merci de coller une source.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/news/ai/generate", {
        source_type: sourceType,
        source_text: sourceText,
      });

      if (res?.news) {
        onGenerated({
          title: res.news.title || "",
          excerpt: res.news.excerpt || "",
          body: res.news.body || "",
        });
      }
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la génération IA");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Vous pouvez partir d’une source existante (post, communiqué,
        article…) pour générer rapidement une news partenaire.
      </p>

      {/* TYPE SOURCE */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Type de source
        </label>
        <select
          value={sourceType}
          onChange={(e) =>
            setSourceType(e.target.value as SourceType)
          }
          className="border rounded p-2 w-full"
        >
          <option value="LINKEDIN_POST">Post LinkedIn</option>
          <option value="PRESS_RELEASE">Communiqué / Blog</option>
          <option value="ARTICLE">Article</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OTHER">Autre</option>
        </select>
      </div>

      {/* SOURCE TEXT */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Source brute
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="border rounded p-2 w-full h-40"
          placeholder="Collez ici le texte source à transformer en news…"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={generate}
          disabled={loading}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          {loading ? "Génération…" : "Générer la news"}
        </button>

        <button
          onClick={onSkip}
          type="button"
          className="px-4 py-2 rounded border"
        >
          Écrire manuellement
        </button>
      </div>
    </div>
  );
}

