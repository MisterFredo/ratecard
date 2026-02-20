"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const SITE_URL = "https://ratecard-frontend.onrender.com";

type Props = {
  newsId: string;
  title: string;
  excerpt: string;
};

type Mode = "manual" | "ai";

export default function NewsStepLinkedIn({
  newsId,
  title,
  excerpt,
}: Props) {
  const [mode, setMode] = useState<Mode>("manual");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------------------------------------------------------
     LOAD EXISTING LINKEDIN POST (IF ANY)
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/news/${newsId}/linkedin`);

        if (res?.text) {
          setText(res.text);
          setMode(res.mode || "manual");
        }
      } catch (e) {
        console.error("Erreur chargement post LinkedIn", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [newsId]);

  /* ---------------------------------------------------------
     SAVE (UPSERT)
  --------------------------------------------------------- */
  async function save(currentText = text, currentMode = mode) {
    if (!currentText.trim()) return;

    setSaving(true);

    try {
      await api.post(`/news/${newsId}/linkedin`, {
        text: currentText,
        mode: currentMode,
      });
    } catch (e) {
      console.error("Erreur sauvegarde post LinkedIn", e);
      alert("Erreur sauvegarde du post LinkedIn");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------
     GENERATE WITH AI (ONE NEWS)
  --------------------------------------------------------- */
  async function generateWithAI() {
    setGenerating(true);

    try {
      const res = await api.post(
        `/news/${newsId}/linkedin/generate`,
        {} // ⚠️ body requis par le wrapper api.post
      );

      if (res?.text) {
        setText(res.text);
        setMode("ai");
        await save(res.text, "ai");
      }
    } catch (e) {
      console.error("Erreur génération IA LinkedIn", e);
      alert("Erreur lors de la génération IA");
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

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement…</div>;
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
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />
          <span>Manuel</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === "ai"}
            onChange={() => setMode("ai")}
          />
          <span>Assisté IA</span>
        </label>
      </div>

      {/* TEXT */}
      <div>
        <label className="block font-medium mb-1">
          Texte du post LinkedIn
        </label>
        <textarea
          className="w-full border rounded p-3 min-h-[260px]"
          placeholder={
            mode === "manual"
              ? "Rédige le texte du post LinkedIn…"
              : "Clique sur « Générer avec l’IA » pour produire un texte"
          }
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMode("manual");
          }}
          onBlur={() => save()}
        />
        <div className="text-xs text-gray-500 mt-1">
          {text.length} caractères
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 pt-2">
        {mode === "ai" && (
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

        {saving && (
          <span className="text-xs text-gray-500 self-center">
            Sauvegarde…
          </span>
        )}
      </div>

      {/* INFO */}
      <div className="text-xs text-gray-500 pt-2">
        Lien public de la news :
        <br />
        {SITE_URL}/news?news_id={newsId}
      </div>
    </div>
  );
}
