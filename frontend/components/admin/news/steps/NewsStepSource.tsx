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
    body: string;
  }) => void;

  onContinue: () => void;
};

export default function NewsStepSource({
  onGenerated,
  onContinue,
}: Props) {
  const [sourceType, setSourceType] =
    useState<SourceType>("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    // Cas 1 — aucune source → on continue directement
    if (!sourceText.trim()) {
      onContinue();
      return;
    }

    // Cas 2 — source fournie → IA
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
          body: res.news.body || "",
        });
      }

      onContinue();
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la génération à partir de la source.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Vous pouvez partir d’une source existante (post, communiqué,
        article…) pour préremplir une news, ou passer directement
        à l’étape suivante pour écrire manuellement.
      </p>

      {/* TYPE SOURCE */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Type de source (optionnel)
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
          Source brute (optionnelle)
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="border rounded p-2 w-full h-40"
          placeholder="Collez ici le texte source si vous souhaitez préremplir la news…"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* ACTION */}
      <div className="flex gap-3">
        <button
          onClick={handleContinue}
          disabled={loading}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          {loading ? "Traitement…" : "Continuer"}
        </button>
      </div>
    </div>
  );
}
