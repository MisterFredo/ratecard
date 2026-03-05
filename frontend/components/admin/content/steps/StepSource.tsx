"use client";

import { useState } from "react";

type SourceId =
  | "LINKEDIN"
  | "PRESS_RELEASE"
  | "ARTICLE"
  | "INTERVIEW"
  | "BLOG"
  | "OTHER";

type Props = {
  onSubmit: (data: {
    source_id: SourceId;
    text: string;
  }) => void;
};

export default function StepSource({ onSubmit }: Props) {

  const [sourceId, setSourceId] =
    useState<SourceId>("LINKEDIN");

  const [sourceText, setSourceText] = useState("");

  const charCount = sourceText.length;

  const isValid =
    sourceText.trim().length >= 80;

  function validate() {

    if (!sourceText.trim()) {
      alert("Merci de fournir une source.");
      return;
    }

    if (sourceText.trim().length < 80) {
      alert("La source semble trop courte.");
      return;
    }

    onSubmit({
      source_id: sourceId,
      text: sourceText.trim(),
    });
  }

  return (

    <div className="space-y-6">

      {/* SOURCE TYPE */}

      <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">

        <div className="flex-1 space-y-1">

          <label className="text-sm font-medium">
            Source
          </label>

          <select
            value={sourceId}
            onChange={(e) =>
              setSourceId(e.target.value as SourceId)
            }
            className="border rounded p-2 w-full"
          >
            <option value="LINKEDIN">Post LinkedIn</option>
            <option value="PRESS_RELEASE">Communiqué / Blog</option>
            <option value="ARTICLE">Article</option>
            <option value="INTERVIEW">Interview</option>
            <option value="BLOG">Blog</option>
            <option value="OTHER">Autre</option>
          </select>

        </div>

        <div className="text-xs text-gray-500 md:mb-2">
          {charCount} caractères
        </div>

      </div>


      {/* SOURCE TEXT */}

      <div className="space-y-1">

        <label className="text-sm font-medium">
          Source brute
        </label>

        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="border rounded p-3 w-full h-44"
          placeholder="Collez ici le texte source à synthétiser..."
        />

        <p className="text-xs text-gray-500">
          Le résumé sera strictement basé sur ce texte.
        </p>

      </div>


      {/* ACTION */}

      <div>

        <button
          onClick={validate}
          disabled={!isValid}
          className={`px-5 py-2 rounded font-medium text-white ${
            isValid
              ? "bg-ratecard-blue"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Générer le résumé
        </button>

      </div>

    </div>

  );

}
