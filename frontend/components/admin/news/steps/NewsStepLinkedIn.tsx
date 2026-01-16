"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const SITE_URL = "https://ratecard-frontend.onrender.com";

type Props = {
  newsId: string;
  title: string;
  excerpt: string;
};

type Mode = "MANUAL" | "AI";

export default function NewsStepLinkedIn({
  newsId,
  title,
  excerpt,
}: Props) {
  const [mode, setMode] = useState<Mode>("MANUAL");
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);

  /* ---------------------------------------------------------
     IA — Génération depuis UNE news
  --------------------------------------------------------- */
  async function generateWithAI() {
    setGenerating(true);

    try {
      const res = await api.post("/public/linkedin/generate", {
        sources: [
          {
            type: "news",
            title,
            excerpt,
          },
        ],
      });

      if (res?.text) {
        setText(res.text);
      }
    } catch (e) {
      console.error("Erreur génération IA LinkedIn (news)", e);
      alert("Erreur lors de la génération du post LinkedIn");
    } finally {
      setGenerating(false);
    }
  }

  /* ---------------------------------------------------------
     COPY
  --------------------------------------------------------- */
  function copyPost() {
    navigator.clipboard.writeText(text);
    alert("Post LinkedIn copié. Prêt à être publié.");
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* MODE */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === "MANUAL"}
            onChange={() => setMode("MANUAL")}
          />
          <span>Manuel</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === "AI"}
            onChange={() => setMode("AI")}
          />
          <span>Assisté IA</span>
        </label>
      </div>

      {/* TEXTE */}
      <div>
        <label className="block font-medium mb-1">
          Texte du post LinkedIn
        </label>
        <textarea
          className="w-full border rounded p-3 min-h-[240px]"
          placeholder={
            mode === "MANUAL"
              ? "Rédige le texte du post LinkedIn…"
              : "Clique sur « Générer avec l’IA » pour produire un texte"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="text-xs text-gray-500 mt-1">
          {text.length} caractères
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 pt-2">
        {mode === "AI" && (
          <button
            onClick={generateWithAI}
            disabled={generating}
            className="bg-ratecard-blue text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {generating
              ? "Génération en cours…"
              : "Générer avec l’IA"}
          </button>
        )}

        <button
          onClick={copyPost}
          disabled={!text.trim()}
          className="bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          Copier le post
        </button>
      </div>

      {/* INFO */}
      <div className="text-xs text-gray-500 pt-2">
        Le lien vers la news pourra être ajouté manuellement dans LinkedIn :
        <br />
        {SITE_URL}/news?news_id={newsId}
      </div>
    </div>
  );
}
