"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Source = {
  SOURCE_ID: string;
  NAME: string;
};

type Props = {
  onSubmit: (data: {
    source_id: string;
    text: string;
  }) => void;
};

export default function StepSource({ onSubmit }: Props) {

  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState<string>("");

  const [sourceText, setSourceText] = useState("");

  const charCount = sourceText.length;

  const isValid =
    sourceText.trim().length >= 80 && sourceId;

  // ==========================================================
  // LOAD SOURCES
  // ==========================================================

  useEffect(() => {

    async function loadSources() {

      try {

        const res = await api.get("/source/list");
        const list = res.sources || [];

        setSources(list);

        if (list.length) {
          setSourceId(list[0].SOURCE_ID);
        }

      } catch (e) {

        console.error(e);
        alert("Impossible de charger les sources");

      }

    }

    loadSources();

  }, []);

  // ==========================================================
  // VALIDATE
  // ==========================================================

  function validate() {

    if (!sourceText.trim()) {
      alert("Merci de fournir une source.");
      return;
    }

    if (sourceText.trim().length < 80) {
      alert("La source semble trop courte.");
      return;
    }

    if (!sourceId) {
      alert("Merci de sélectionner une source.");
      return;
    }

    onSubmit({
      source_id: sourceId,
      text: sourceText.trim(),
    });

  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-8">

      {/* SOURCE SELECTOR */}

      <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">

        <div className="flex-1 space-y-1">

          <label className="text-sm font-medium">
            Source
          </label>

          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            {sources.map((s) => (
              <option
                key={s.SOURCE_ID}
                value={s.SOURCE_ID}
              >
                {s.NAME}
              </option>
            ))}
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
          Valider la source
        </button>

      </div>

    </div>

  );

}
