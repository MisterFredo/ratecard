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
  onApplyDraft: (draft: {
    title?: string;
    excerpt?: string;
    content_html?: string;
    intro?: string;
  }) => void;
};

export default function ArticleSourcePanel({ onApplyDraft }: Props) {
  const [sourceType, setSourceType] = useState<SourceType>("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     TRANSFORM SOURCE → ARTICLE (IA)
  --------------------------------------------------------- */
  async function transform() {
    if (!sourceText.trim()) {
      alert("Merci de coller une source à transformer");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/lab-light/transform", {
        source_type: sourceType,
        source_text: sourceText,
        author: author || "",
      });

      if (!res || res.error) {
        console.error(res);
        alert("Erreur lors de la transformation IA");
        setLoading(false);
        return;
      }

      onApplyDraft({
        title: res.title_proposal || "",
        excerpt: res.excerpt || "",
        content_html: res.content_html || "",
        intro: res.angle || "",
      });
    } catch (e) {
      console.error(e);
      alert("Erreur IA");
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-4 border rounded p-4 bg-white">

      <h2 className="text-lg font-semibold text-ratecard-blue">
        Transformer une source en article
      </h2>

      {/* TYPE SOURCE */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Type de source</label>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value as SourceType)}
          className="border rounded p-2 w-full"
        >
          <option value="LINKEDIN_POST">Post LinkedIn</option>
          <option value="PRESS_RELEASE">Communiqué / Blog</option>
          <option value="ARTICLE">Article</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OTHER">Autre</option>
        </select>
      </div>

      {/* AUTEUR */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Auteur (optionnel)</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* SOURCE TEXT */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Source brute</label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Collez ici le texte source à transformer…"
          className="border rounded p-2 w-full h-48"
        />
      </div>

      {/* ACTION */}
      <button
        onClick={transform}
        disabled={loading}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        {loading ? "Transformation…" : "Transformer en article"}
      </button>
    </div>
  );
}
